# API Keys System Setup Guide

## Quick Setup

### Option 1: Basic Setup (Recommended for most users)

Run this in your Supabase SQL editor:

```sql
-- Copy and paste the contents of api_keys_schema.sql
-- This creates the API keys table with user-only access
```

### Option 2: Admin Setup (For organizations with multiple users)

1. **Add role column to profiles:**
```sql
-- Copy and paste the contents of add_role_column.sql
```

2. **Enable admin policies:**
```sql
-- Uncomment the admin policies in api_keys_schema.sql and run them
-- This allows admins to view and manage all API keys
```

3. **Set admin users:**
```sql
-- Replace 'your-user-id-here' with actual user ID
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id-here';
```

## What Each File Does

### `api_keys_schema.sql`
- Creates the `api_keys` table
- Sets up Row Level Security (RLS) policies
- Creates database functions for key validation
- Enables user-only access (users can only manage their own keys)

### `add_role_column.sql`
- Adds a `role` column to the `profiles` table
- Sets up role constraints and indexes
- Enables admin functionality

## Testing the Setup

1. **Start your application:**
```bash
npm run dev
```

2. **Run the test script:**
```powershell
.\test-api-keys.ps1
```

3. **Test in browser:**
   - Log in to your application
   - Navigate to `/it/api-keys` or `/es/api-keys`
   - Try generating a new API key

## Troubleshooting

### Error: "column profiles.role does not exist"
- You're trying to use admin features without the role column
- Run `add_role_column.sql` first, or stick with basic setup

### Error: "relation api_keys does not exist"
- The API keys table hasn't been created
- Run `api_keys_schema.sql` in your Supabase SQL editor

### Error: "permission denied"
- Check that RLS policies are properly set up
- Ensure you're logged in with a valid user account

## Next Steps

After setup:
1. Generate your first API key through the web interface
2. Use the key in your API integrations
3. Monitor usage through the web interface
4. Rotate keys regularly for security

For detailed usage instructions, see `docs/API_KEY_MANAGEMENT.md`. 