'use client'

import { Button } from '@/components/ui/button'
import { logout } from './actions'

export default function LogoutButton() {
  return (
    <Button
      size='sm'
      className='cursor-pointer'
      onClick={async () => await logout()}
    >
      Logout
    </Button>
  )
}
