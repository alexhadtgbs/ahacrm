# ClínicaCRM Troubleshooting Guide

## Common Issues and Solutions

### 1. Authentication Issues

#### Problem: Sign-in button not working
**Symptoms:**
- Clicking sign-in button does nothing
- No console errors
- Form submission not triggered

**Solutions:**
1. Check if the form has proper event handling:
   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault() // Make sure this is present
     // ... rest of the code
   }
   ```

2. Verify the Button component type:
   ```typescript
   <Button type="submit" onClick={handleSubmit}>
     Sign In
   </Button>
   ```

3. Check for JavaScript errors in browser console

#### Problem: Infinite redirect loops
**Symptoms:**
- Page continuously reloading
- Console showing repeated redirect attempts
- Browser showing "Too many redirects" error

**Solutions:**
1. Clear browser cache and cookies
2. Check the `useAuth` hook implementation for singleton pattern
3. Verify redirect guards in pages:
   ```typescript
   const hasRedirected = useRef(false)
   
   useEffect(() => {
     if (user && !hasRedirected.current) {
       hasRedirected.current = true
       router.push(`/${locale}/cases`)
     }
   }, [user, router])
   ```

4. Restart the development server

#### Problem: Authentication state fluctuating
**Symptoms:**
- User state changing between `null` and authenticated user
- Components re-rendering constantly
- Console showing auth state changes

**Solutions:**
1. Ensure singleton pattern is implemented in `useAuth` hook
2. Check for multiple `useAuth` hook instances
3. Verify proper cleanup of auth listeners

### 2. Routing Issues

#### Problem: 404 errors on locale routes
**Symptoms:**
- `/it/cases` returns 404
- `/es/login` not found
- Dynamic routes not working

**Solutions:**
1. Verify folder structure:
   ```
   app/
   ├── [locale]/
   │   ├── layout.tsx
   │   │   └── page.tsx
   │   └── cases/
   │       └── page.tsx
   ```

2. Check middleware configuration:
   ```typescript
   export async function middleware(request: NextRequest) {
     const pathname = request.nextUrl.pathname
     // ... middleware logic
   }
   ```

3. Ensure `app/[locale]/layout.tsx` exists and is properly configured

#### Problem: Middleware not working
**Symptoms:**
- Locale redirects not happening
- Middleware errors in console
- Edge runtime warnings

**Solutions:**
1. Check middleware runtime configuration:
   ```typescript
   export const runtime = 'experimental-edge'
   ```

2. Verify middleware is in the correct location (`middleware.ts` in root)
3. Clear Next.js cache: `rm -rf .next`

### 3. React Errors

#### Problem: Hydration warnings
**Symptoms:**
- Console warnings about hydration mismatches
- Different content on server vs client
- React warnings about `htmlFor` props

**Solutions:**
1. Use stable IDs in Input components:
   ```typescript
   const id = useId()
   const inputId = `${name}-${type}-${id}`
   ```

2. Ensure consistent rendering between server and client
3. Use `suppressHydrationWarning` for dynamic content

#### Problem: "Rendered more hooks than during the previous render"
**Symptoms:**
- React error about hook count mismatch
- Conditional hook calls
- Hook order violations

**Solutions:**
1. Ensure hooks are called in the same order every render
2. Move conditional logic after hooks:
   ```typescript
   // ❌ Wrong
   if (condition) {
     useEffect(() => {}, [])
   }
   
   // ✅ Correct
   useEffect(() => {
     if (condition) {
       // logic here
     }
   }, [condition])
   ```

3. Use proper dependency arrays

#### Problem: "Updating a component during render"
**Symptoms:**
- React warnings about state updates during render
- Router navigation during render
- Infinite re-renders

**Solutions:**
1. Move state updates to `useEffect`:
   ```typescript
   // ❌ Wrong
   if (user) {
     router.push('/cases')
   }
   
   // ✅ Correct
   useEffect(() => {
     if (user) {
       router.push('/cases')
     }
   }, [user, router])
   ```

2. Use proper state management patterns

### 4. TypeScript Errors

#### Problem: Supabase type errors
**Symptoms:**
- TypeScript errors with RPC return types
- Missing type definitions
- Filter argument type mismatches

**Solutions:**
1. Add proper type casting:
   ```typescript
   const { data, error } = await supabase
     .rpc('function_name', params) as { data: any, error: any }
   ```

2. Create comprehensive type definitions in `types/index.ts`
3. Use proper error checking before data processing

#### Problem: Component prop type errors
**Symptoms:**
- TypeScript errors in component props
- Missing required props
- Incorrect prop types

**Solutions:**
1. Define proper interfaces:
   ```typescript
   interface ButtonProps {
     children: React.ReactNode
     type?: 'button' | 'submit' | 'reset'
     variant?: 'primary' | 'outline'
     disabled?: boolean
     onClick?: () => void
     className?: string
   }
   ```

2. Use proper default values
3. Add proper type annotations

### 5. Build and Development Issues

#### Problem: Next.js build warnings
**Symptoms:**
- Unrecognized `appDir` experimental option
- Missing webpack files
- Build compilation warnings

**Solutions:**
1. Update `next.config.js`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // Remove deprecated options
   }
   
   module.exports = nextConfig
   ```

2. Clear build cache: `rm -rf .next`
3. Reinstall dependencies: `npm install`

#### Problem: Edge runtime errors
**Symptoms:**
- "Page provided runtime 'edge'" warnings
- Missing edge runtime webpack files
- Middleware runtime conflicts

**Solutions:**
1. Use `experimental-edge` runtime:
   ```typescript
   export const runtime = 'experimental-edge'
   ```

2. Simplify middleware to avoid edge runtime conflicts
3. Move complex logic to API routes

#### Problem: Development server issues
**Symptoms:**
- Server not starting
- Port conflicts
- Hot reload not working

**Solutions:**
1. Check if port 3000 is available
2. Kill existing processes: `npx kill-port 3000`
3. Clear cache and restart: `rm -rf .next && npm run dev`

### 6. Supabase Issues

#### Problem: Supabase client errors
**Symptoms:**
- "Cannot read property of undefined" errors
- Authentication not working
- API calls failing

**Solutions:**
1. Verify environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Check Supabase project settings
3. Verify client configuration in `lib/supabase/`

#### Problem: Database connection issues
**Symptoms:**
- API routes returning errors
- Database queries failing
- RLS (Row Level Security) issues

**Solutions:**
1. Check Supabase project status
2. Verify database schema and tables
3. Check RLS policies
4. Test API endpoints directly

### 7. Performance Issues

#### Problem: Slow page loads
**Symptoms:**
- Long loading times
- Large bundle sizes
- Slow authentication

**Solutions:**
1. Implement proper loading states
2. Optimize bundle size
3. Use proper caching strategies
4. Implement code splitting

#### Problem: Memory leaks
**Symptoms:**
- Increasing memory usage
- Components not cleaning up
- Multiple event listeners

**Solutions:**
1. Proper cleanup in `useEffect`:
   ```typescript
   useEffect(() => {
     // Setup
     return () => {
       // Cleanup
     }
   }, [])
   ```

2. Remove event listeners on unmount
3. Use singleton patterns for shared state

## Debugging Techniques

### 1. Console Logging
Add strategic console logs to track issues:
```typescript
console.log('Auth state:', { user, loading })
console.log('Component render:', componentName)
console.log('API response:', data)
```

### 2. React DevTools
- Use React DevTools to inspect component state
- Check for unnecessary re-renders
- Monitor prop changes

### 3. Network Tab
- Check API requests in browser dev tools
- Verify request/response data
- Look for failed requests

### 4. Supabase Dashboard
- Monitor database queries
- Check authentication logs
- Verify RLS policies

## Prevention Strategies

### 1. Code Quality
- Use TypeScript for type safety
- Implement proper error boundaries
- Follow React best practices

### 2. Testing
- Write unit tests for components
- Test authentication flows
- Verify API endpoints

### 3. Monitoring
- Implement error tracking
- Monitor performance metrics
- Track user interactions

### 4. Documentation
- Keep documentation updated
- Document known issues
- Maintain troubleshooting guides

## Getting Help

### 1. Check Documentation
- Review this troubleshooting guide
- Check Next.js documentation
- Consult Supabase documentation

### 2. Search Issues
- Look for similar issues in GitHub
- Check Stack Overflow
- Search Next.js/Supabase forums

### 3. Debug Steps
1. Reproduce the issue consistently
2. Check browser console for errors
3. Verify environment setup
4. Test with minimal reproduction
5. Document steps to reproduce

### 4. Contact Support
- Provide detailed error messages
- Include reproduction steps
- Share relevant code snippets
- Mention environment details

This troubleshooting guide should help resolve most common issues encountered during ClínicaCRM development. 