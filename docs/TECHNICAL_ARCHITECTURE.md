# ClínicaCRM Technical Architecture

## Project Structure

```
crm/
├── app/                          # Next.js 14 App Router
│   ├── [locale]/                 # Dynamic locale routing
│   │   ├── layout.tsx           # Locale-specific layout
│   │   ├── login/               # Login page
│   │   │   └── page.tsx
│   │   ├── cases/               # Cases management
│   │   │   ├── page.tsx
│   │   │   └── [id]/            # Individual case view
│   │   │       └── page.tsx
│   │   └── not-found.tsx        # 404 page
│   ├── api/                     # API routes
│   │   └── cases/
│   │       └── route.ts
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Root page
├── components/                   # Reusable UI components
│   └── ui/
│       ├── Button.tsx
│       └── Input.tsx
├── docs/                        # Documentation
│   ├── README.md
│   └── TECHNICAL_ARCHITECTURE.md
├── hooks/                       # Custom React hooks
│   └── useAuth.ts
├── lib/                         # Utility libraries
│   ├── supabase/               # Supabase client configurations
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils.ts                # Utility functions
├── types/                       # TypeScript type definitions
│   └── index.ts
├── middleware.ts                # Next.js middleware
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Authentication Architecture

### Singleton Pattern Implementation

The authentication system uses a singleton pattern to prevent multiple auth listeners and state conflicts:

```typescript
// hooks/useAuth.ts
let authState: {
  user: User | null
  loading: boolean
  initialized: boolean
  listeners: Set<(user: User | null, loading: boolean) => void>
} = {
  user: null,
  loading: true,
  initialized: false,
  listeners: new Set()
}
```

### Authentication Flow

1. **Initialization**: Auth state is initialized once when the first component mounts
2. **Session Check**: Current session is retrieved from Supabase
3. **State Management**: All components subscribe to auth state changes
4. **Cleanup**: Listeners are properly removed when components unmount

### Supabase Client Configuration

Three separate Supabase clients for different contexts:

#### Client-Side (`lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### Server-Side (`lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'

export const createClient = (request: Request, response: Response) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )
}
```

#### Middleware (`lib/supabase/middleware.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'

export const createClient = (request: NextRequest, response: NextResponse) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )
}
```

## Routing Architecture

### Dynamic Locale Routing

The application uses Next.js 14 dynamic routing with `[locale]` parameter:

```
/[locale]/login     # /it/login, /es/login
/[locale]/cases     # /it/cases, /es/cases
/[locale]/cases/[id] # /it/cases/1, /es/cases/1
```

### Middleware Implementation

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for static files and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Extract locale from pathname
  const localeMatch = pathname.match(/^\/([a-z]{2})\//)
  const locale = localeMatch ? localeMatch[1] : 'it'

  // Handle root path redirect to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  // Handle locale-less paths
  if (!localeMatch && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
  }

  return NextResponse.next()
}
```

## Component Architecture

### Input Component

The Input component uses stable ID generation to prevent hydration mismatches:

```typescript
// components/ui/Input.tsx
export function Input({ 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  className = '' 
}: InputProps) {
  const id = useId()
  const inputId = `${name}-${type}-${id}`

  return (
    <>
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`input-field ${className}`}
      />
    </>
  )
}
```

### Button Component

```typescript
// components/ui/Button.tsx
export function Button({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  onClick, 
  className = '' 
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors'
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100'
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
```

## State Management

### Authentication State

The authentication state is managed through a singleton pattern with listeners:

```typescript
// State structure
interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  listeners: Set<(user: User | null, loading: boolean) => void>
}

// State updates
const updateAuthState = (user: User | null, loading: boolean) => {
  authState.user = user
  authState.loading = loading
  authState.listeners.forEach(listener => listener(user, loading))
}
```

### Component State

Components use React's built-in state management:

```typescript
// Login page state
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const hasRedirected = useRef(false)
```

## API Architecture

### Cases API Route

```typescript
// app/api/cases/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = Object.fromEntries(searchParams.entries())
    
    const supabase = createClient(request, new Response())
    
    // Build query with filters
    let query = supabase.from('cases').select('*')
    
    // Apply filters
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
  }
}
```

## Type Safety

### Type Definitions

```typescript
// types/index.ts
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

export interface CaseFilters {
  search?: string
  status?: string
  channel?: string
  date_from?: string
  date_to?: string
}
```

## Styling Architecture

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
      },
    },
  },
  plugins: [],
}
```

### CSS Variables

```css
/* app/globals.css */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}
```

## Performance Optimizations

### 1. Singleton Pattern
- Prevents multiple auth listeners
- Reduces memory usage
- Ensures consistent state

### 2. Proper Cleanup
- Listeners removed on unmount
- Prevents memory leaks
- Clean component lifecycle

### 3. Stable IDs
- Prevents hydration mismatches
- Consistent server/client rendering
- Better user experience

### 4. Optimized Renders
- Minimal re-renders
- Efficient state updates
- Proper dependency arrays

## Security Considerations

### 1. Environment Variables
- Sensitive data in `.env.local`
- Not committed to version control
- Proper Supabase key management

### 2. Authentication
- Server-side session validation
- Client-side route protection
- Proper logout handling

### 3. API Security
- Supabase RLS (Row Level Security)
- Input validation
- Error handling without data exposure

## Deployment Considerations

### 1. Environment Setup
- Supabase project configuration
- Environment variables in production
- Database migrations

### 2. Build Optimization
- Next.js production build
- Static asset optimization
- Bundle size optimization

### 3. Monitoring
- Error tracking
- Performance monitoring
- User analytics

## Testing Strategy

### 1. Unit Tests
- Component testing with React Testing Library
- Hook testing
- Utility function testing

### 2. Integration Tests
- API route testing
- Authentication flow testing
- Database integration testing

### 3. E2E Tests
- User journey testing
- Cross-browser testing
- Mobile responsiveness testing

## Future Enhancements

### 1. Real-time Features
- Supabase real-time subscriptions
- Live case updates
- Notifications

### 2. Advanced Features
- File uploads
- Email integration
- Calendar integration

### 3. Performance
- Server-side rendering optimization
- Image optimization
- Caching strategies

This technical architecture provides a solid foundation for the ClínicaCRM application with proper separation of concerns, type safety, and performance optimizations. 