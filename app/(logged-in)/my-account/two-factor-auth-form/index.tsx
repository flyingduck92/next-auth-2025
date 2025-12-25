'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { activate2FA, disabled2FA, get2FASecret } from './actions'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'

type twoFactorActivatedProps = {
  twoFactorActivated: boolean
}

function TwoFactorAuthForm({ twoFactorActivated }: twoFactorActivatedProps) {
  const [is2FActivated, setIs2FActivated] = useState(twoFactorActivated)
  const [step, setStep] = useState(1)
  const [code, setCode] = useState('')
  const [otp, setOtp] = useState('')

  const handleEnable2FA = async () => {
    const response = await get2FASecret()
    if (response.error) {
      toast.error(response.message)
      return
    }

    // step 2 - Display QRCode
    setStep(2)
    setCode(response.twoFactorSecret ?? '')
  }

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const response = await activate2FA(otp)
    if (response?.error) {
      toast.error(response.message)
      return
    }

    toast.success('Two-Factor Authentication has been enabled')
    setIs2FActivated(true)
  }

  const handleDisable2FA = async () => {
    await disabled2FA()

    toast.success('Two-Factor Authentication has been disabled')
    setIs2FActivated(false)
  }

  return (
    <div>
      {is2FActivated && (
        <Button
          variant='destructive'
          className='cursor-pointer w-full'
          onClick={handleDisable2FA}
        >
          Disable Two-Factor Authentication
        </Button>
      )}
      {!is2FActivated && (
        <div>
          {step === 1 && (
            <Button
              className='cursor-pointer w-full'
              onClick={handleEnable2FA}
            >
              Enable Two-Factor Authentication
            </Button>
          )}
          {step === 2 && (
            <div>
              <p className='text-muted-foreground text-xs'>
                Scan the QRCode below in the Google Authenticator app to
                activate Two-Factor Authentication.
              </p>
              <QRCodeSVG
                value={code}
                className='my-4 mx-auto'
              />
              <Button
                className='w-full cursor-pointer'
                onClick={() => setStep(3)}
              >
                I have scanned the QRCode
              </Button>
              <Button
                className='mt-2 w-full cursor-pointer'
                variant='outline'
                onClick={() => setStep(1)}
              >
                Cancel
              </Button>
            </div>
          )}
          {step === 3 && (
            <form
              onSubmit={handleOTPSubmit}
              className='flex flex-col gap-2'
            >
              <p className='text-xs text-muted-foreground'>
                Please enter the one-time passcode from Google Authenticator App
              </p>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button
                disabled={otp.length !== 6}
                type='submit'
                className='disabled:cursor-not-allowed disabled:pointer-events-auto cursor-pointer'
              >
                Submit and Activate
              </Button>
              <Button
                className='cursor-pointer'
                variant='outline'
                onClick={() => setStep(2)}
              >
                Cancel
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default TwoFactorAuthForm
