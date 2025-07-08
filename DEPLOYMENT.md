# 🚀 Deployment Guide - ClínicaCRM to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab Account**: Your code should be in a Git repository
3. **Supabase Project**: Your database should be set up and running

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub/GitLab
```bash
# If you haven't already, push your code to GitHub
git remote add origin https://github.com/yourusername/clinicacrm.git
git push -u origin master
```

### 1.2 Environment Variables
You'll need to set these environment variables in Vercel:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# API Key (for API authentication)
API_KEY_SECRET=your_api_key_secret

# Next.js Configuration
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import Repository**
   - Connect your GitHub/GitLab account
   - Select your `clinicacrm` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `.next` (should auto-detect)
   - **Install Command**: `npm install` (should auto-detect)

4. **Environment Variables**
   - Click "Environment Variables"
   - Add all the variables listed above
   - Make sure to set them for all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts**
   - Link to existing project or create new
   - Set environment variables
   - Deploy

## Step 3: Configure Custom Domain (Optional)

1. **Go to Project Settings**
   - In your Vercel dashboard, go to your project
   - Click "Settings" → "Domains"

2. **Add Custom Domain**
   - Enter your domain (e.g., `clinicacrm.yourdomain.com`)
   - Follow DNS configuration instructions

## Step 4: Database Setup

### 4.1 Run Database Migrations
1. **Go to Supabase Dashboard**
   - Open your Supabase project
   - Go to SQL Editor

2. **Run Migration Script**
   ```sql
   -- Run the migration to add new fields
   \i database/add_phone_and_disposition_fields.sql
   
   -- Run the seed data
   \i database/seed_data.sql
   ```

### 4.2 Verify Database Connection
- Test your app's authentication
- Verify cases are loading
- Test API endpoints

## Step 5: Post-Deployment Verification

### 5.1 Test Core Features
- [ ] Authentication (login/logout)
- [ ] Cases list and detail pages
- [ ] Case notes functionality
- [ ] API key management
- [ ] CSV export for appointments
- [ ] Internationalization (it/es locales)

### 5.2 Test API Endpoints
- [ ] `/api/cases` - CRUD operations
- [ ] `/api/notes` - Notes management
- [ ] `/api/api-keys` - API key management
- [ ] `/api/export` - CSV export
- [ ] `/api-docs` - Swagger documentation

## Environment-Specific Configurations

### Production Environment
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
API_KEY_SECRET=your_production_api_key
```

### Preview Environment (for PRs)
```env
NODE_ENV=preview
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
API_KEY_SECRET=your_preview_api_key
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

2. **Environment Variables**
   - Double-check all Supabase credentials
   - Ensure API keys are correctly set
   - Verify variable names match your code

3. **Database Connection Issues**
   - Check Supabase project status
   - Verify RLS policies are configured
   - Test database connection locally first

4. **Authentication Issues**
   - Verify Supabase auth settings
   - Check redirect URLs in Supabase dashboard
   - Ensure cookies are working in production

### Performance Optimization

1. **Enable Edge Functions** (if needed)
   - Update `vercel.json` for edge runtime
   - Optimize API routes for edge deployment

2. **Image Optimization**
   - Use Next.js Image component
   - Configure image domains in `next.config.js`

3. **Caching**
   - Implement proper caching headers
   - Use SWR for data fetching

## Monitoring and Analytics

1. **Vercel Analytics**
   - Enable in project settings
   - Monitor performance metrics

2. **Error Tracking**
   - Consider adding Sentry or similar
   - Monitor API errors

3. **Database Monitoring**
   - Use Supabase dashboard
   - Monitor query performance

## Security Checklist

- [ ] Environment variables are set
- [ ] API keys are secure
- [ ] RLS policies are configured
- [ ] CORS is properly configured
- [ ] Authentication is working
- [ ] HTTPS is enforced

## Support

If you encounter issues:
1. Check Vercel build logs
2. Review Supabase logs
3. Test locally with production environment variables
4. Check this deployment guide
5. Review Next.js deployment documentation

---

**Your ClínicaCRM app should now be live on Vercel! 🎉** 