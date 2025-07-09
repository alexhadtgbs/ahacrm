import { Logo } from './Logo'
import { Button } from './Button'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { getCurrentLocale } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

interface HeaderProps {
  className?: string
}

export function Header({ className = '' }: HeaderProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      const locale = getCurrentLocale()
      router.push(`/${locale}/login`)
    }
  }

  return (
    <header className={`bg-primary dark:bg-surface shadow-sm border-b border-primary dark:border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo 
              width={180}
              height={50}
              showBackground={true}
              backgroundColor="#004B93"
            />
          </div>
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            {mounted && (
              <button
                aria-label="Toggle dark mode"
                className="rounded-full p-2 border border-white/20 dark:border-border bg-white/10 dark:bg-surface text-white dark:text-foreground hover:bg-white/20 dark:hover:bg-gray-700 transition"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            )}
            {user && (
              <>
                <span className="text-sm text-white dark:text-foreground">
                  Welcome, {user.email}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-sm header-button"
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 