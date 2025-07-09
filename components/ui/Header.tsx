import { Logo } from './Logo'
import { Button } from './Button'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { getCurrentLocale } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className = '' }: HeaderProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      const locale = getCurrentLocale()
      router.push(`/${locale}/login`)
    }
  }

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
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
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.email}
              </span>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-sm"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 