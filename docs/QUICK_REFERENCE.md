# ClínicaCRM Quick Reference Guide

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Clear Next.js cache
rm -rf .next

# Kill port 3000 (if needed)
npx kill-port 3000
```

### TypeScript
```bash
# Check TypeScript errors
npx tsc --noEmit

# Type check specific file
npx tsc --noEmit app/[locale]/login/page.tsx
```

## Environment Variables

Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Key File Locations

### Core Files
- `middleware.ts` - Next.js middleware for locale routing
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

### Authentication
- `hooks/useAuth.ts` - Authentication hook (singleton pattern)
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/middleware.ts` - Middleware Supabase client

### Pages
- `app/[locale]/login/page.tsx` - Login page
- `app/[locale]/cases/page.tsx` - Cases management page
- `app/[locale]/cases/[id]/page.tsx` - Individual case page
- `app/[locale]/layout.tsx` - Locale-specific layout

### Components
- `components/ui/Button.tsx` - Reusable button component
- `components/ui/Input.tsx` - Reusable input component

### API Routes
- `app/api/cases/route.ts` - Cases API endpoint

### Types
- `types/index.ts` - TypeScript type definitions

## Common Code Snippets

### Authentication Hook Usage
```typescript
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>
  
  return <div>Welcome, {user.email}</div>
}
```

### Form Handling
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  
  try {
    const { data, error } = await signIn(email, password)
    if (error) throw error
    // Handle success
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

### Protected Route Pattern
```typescript
useEffect(() => {
  if (user === null && !hasRedirected.current) {
    hasRedirected.current = true
    router.push(`/${locale}/login`)
  }
}, [user, router])
```

### API Route Pattern
```typescript
export async function GET(request: Request) {
  try {
    const supabase = createClient(request, new Response())
    const { data, error } = await supabase.from('table').select('*')
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

### Component with Props
```typescript
interface MyComponentProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function MyComponent({ title, children, className = '' }: MyComponentProps) {
  return (
    <div className={`my-component ${className}`}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

## Routing Patterns

### Dynamic Locale Routes
```
/[locale]/login     # /it/login, /es/login
/[locale]/cases     # /it/cases, /es/cases
/[locale]/cases/[id] # /it/cases/1, /es/cases/1
```

### Navigation
```typescript
import { useRouter } from 'next/navigation'
import { getCurrentLocale } from '@/lib/utils'

const router = useRouter()
const locale = getCurrentLocale()

// Navigate to cases
router.push(`/${locale}/cases`)

// Navigate to specific case
router.push(`/${locale}/cases/${caseId}`)
```

## Styling Patterns

### Tailwind CSS Classes
```typescript
// Common button styles
const buttonClasses = 'px-4 py-2 rounded-md font-medium transition-colors'

// Common input styles
const inputClasses = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'

// Layout classes
const containerClasses = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
const cardClasses = 'bg-white shadow-md rounded-lg p-6'
```

### CSS Variables
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
}
```

## Type Definitions

### Case Interface
```typescript
export interface Case {
  id: number
  created_at: string
  assigned_to: string
  first_name: string
  last_name: string
  phone: string
  email?: string
  channel: 'WEB' | 'FACEBOOK' | 'PHONE' | 'EMAIL'
  origin: string
  status: 'IN_CORSO' | 'APPUNTAMENTO' | 'CHIUSO'
  outcome: string
  clinic: string
  treatment: string
  promotion?: string
  follow_up_date?: string
  dialer_campaign_tag?: string
}
```

### Component Props
```typescript
interface ButtonProps {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'outline'
  disabled?: boolean
  onClick?: () => void
  className?: string
}

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number'
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  className?: string
}
```

## Debugging Commands

### Console Logging
```typescript
// Debug authentication
console.log('Auth state:', { user: user?.email, loading })

// Debug API calls
console.log('API response:', { data, error })

// Debug component renders
console.log('Component render:', componentName)
```

### Browser DevTools
- **Network Tab**: Check API requests
- **Console**: View logs and errors
- **React DevTools**: Inspect component state
- **Application Tab**: Check localStorage/sessionStorage

## Common Issues & Quick Fixes

### Authentication Not Working
1. Check environment variables
2. Clear browser cache
3. Restart development server
4. Check Supabase project settings

### Redirect Loops
1. Clear browser cache and cookies
2. Check `useAuth` hook implementation
3. Verify redirect guards
4. Restart development server

### TypeScript Errors
1. Run `npx tsc --noEmit`
2. Check type definitions
3. Add proper type casting
4. Update interfaces

### Build Errors
1. Clear cache: `rm -rf .next`
2. Reinstall dependencies: `npm install`
3. Check `next.config.js`
4. Verify TypeScript configuration

## Performance Tips

### Optimization
- Use singleton patterns for shared state
- Implement proper cleanup in `useEffect`
- Use stable IDs for form elements
- Optimize bundle size with code splitting

### Best Practices
- Follow React hooks rules
- Use proper dependency arrays
- Implement error boundaries
- Add loading states

## Testing

### Manual Testing Checklist
- [ ] Authentication flow (login/logout)
- [ ] Protected routes
- [ ] Locale switching
- [ ] Form submissions
- [ ] API calls
- [ ] Responsive design
- [ ] Error handling

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Set production environment variables
- Configure Supabase project
- Set up database migrations
- Configure domain and SSL

This quick reference guide provides essential information for developers working on the ClínicaCRM project. 