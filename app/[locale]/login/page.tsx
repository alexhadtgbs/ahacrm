'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/ui/Logo'
import { getCurrentLocale } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signIn, user } = useAuth()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // If user is already authenticated and we haven't redirected yet, redirect to cases
    if (user && !hasRedirected.current) {
      console.log('User is authenticated, redirecting from login page...')
      hasRedirected.current = true
      const locale = getCurrentLocale()
      console.log('Redirecting authenticated user to:', `/${locale}/cases`)
      router.push(`/${locale}/cases`)
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('Sign-in attempt with:', { email, password: '***' })

    try {
      if (!email || !password) {
        setError('Please enter both email and password')
        setLoading(false)
        return
      }

      console.log('Calling signIn...')
      const { data, error } = await signIn(email, password)
      console.log('SignIn result:', { data: data?.user?.email, error })

      if (error) {
        console.error('SignIn error:', error)
        setError(error.message || 'Invalid email or password')
        setLoading(false)
        return
      }

      if (data.user) {
        console.log('SignIn successful, redirecting...')
        const locale = getCurrentLocale()
        console.log('Redirecting to:', `/${locale}/cases`)
        try {
          await router.replace(`/${locale}/cases`)
          console.log('Router.replace completed')
        } catch (redirectError) {
          console.error('Redirect error:', redirectError)
          // Fallback to window.location if router fails
          window.location.href = `/${locale}/cases`
        }
      } else {
        setError('Authentication failed')
        setLoading(false)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  // If user is authenticated, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-foreground dark:text-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo 
            className="mx-auto mb-6"
            width={250}
            height={75}
            showBackground={true}
            backgroundColor="#004B93"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground dark:text-foreground">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="rounded-t-md"
            />
            <Input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="rounded-b-md"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
} 