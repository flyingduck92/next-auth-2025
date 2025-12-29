import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className='flex min-h-screen items-center justify-center  font-sans dark:bg-black'>
      <main className='flex flex-col w-full justify-center items-center gap-4 bg-white dark:bg-black'>
        <header>
          <Link href='/'>
            <Image
              className='dark:invert'
              src='/next.svg'
              alt='Next.js logo'
              width={100}
              height={20}
              priority
            />
            <h2>NEXT-AUTH 2025</h2>
          </Link>
        </header>
        <div className='flex items-center gap-4'>
          <Button asChild>
            <Link href='/register'>Register</Link>
          </Button>
          <small>or</small>
          <Button
            asChild
            variant='outline'
          >
            <Link href='/login'>Login</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
