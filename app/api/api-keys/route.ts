import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { 
  createNewApiKey, 
  hashApiKey, 
  validateApiKeyFormat,
  formatApiKeyForDisplay 
} from '@/lib/api-keys'

// GET /api/api-keys - List user's API keys
export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's API keys
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('created_by', user.id as any)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
    }
    
    // Format API keys for display (don't show full key hash)
    const formattedKeys = (apiKeys || []).map((key: any) => ({
      id: key.id,
      name: key.name,
      description: key.description,
      created_at: key.created_at,
      expires_at: key.expires_at,
      is_active: key.is_active,
      permissions: key.permissions,
      last_used: key.last_used,
      usage_count: key.usage_count,
      key_preview: formatApiKeyForDisplay(key.key_hash, 8) // Show first 8 chars of hash
    }))
    
    return NextResponse.json(formattedKeys)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/api-keys - Create new API key
export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { name, description, expiresInDays, permissions, keyType } = body
    
    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    // Generate new API key
    const { key, metadata } = createNewApiKey(name.trim(), user.id, {
      description: description?.trim(),
      expiresInDays: expiresInDays ? parseInt(expiresInDays) : undefined,
      permissions: permissions || ['read', 'write'],
      keyType: keyType || 'secure'
    })
    
    // Hash the key for storage
    const keyHash = hashApiKey(key)
    
    // Store in database
    const { data: storedKey, error } = await supabase
      .from('api_keys')
      .insert({
        key_hash: keyHash,
        name: metadata.name,
        description: metadata.description,
        created_at: metadata.created_at,
        expires_at: metadata.expires_at,
        is_active: metadata.is_active,
        created_by: metadata.created_by as any,
        permissions: metadata.permissions,
        usage_count: metadata.usage_count
      } as any)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
    }
    
    // Return the API key (this is the only time the full key is shown)
    return NextResponse.json({
      id: (storedKey as any).id,
      key: key, // Full API key (only shown once)
      name: (storedKey as any).name,
      description: (storedKey as any).description,
      created_at: (storedKey as any).created_at,
      expires_at: (storedKey as any).expires_at,
      permissions: (storedKey as any).permissions,
      message: 'API key created successfully. Please save this key securely - it will not be shown again.'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/api-keys - Update API key
export async function PUT(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { id, name, description, is_active, permissions, expiresInDays } = body
    
    if (!id) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 })
    }
    
    // Build update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim()
    if (is_active !== undefined) updateData.is_active = is_active
    if (permissions !== undefined) updateData.permissions = permissions
    
    // Handle expiration
    if (expiresInDays !== undefined) {
      if (expiresInDays === null) {
        updateData.expires_at = null
      } else {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays))
        updateData.expires_at = expiresAt.toISOString()
      }
    }
    
    // Update API key
    const { data: updatedKey, error } = await supabase
      .from('api_keys')
      .update(updateData)
      .eq('id', id)
      .eq('created_by', user.id as any) // Ensure user owns the key
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 })
    }
    
    if (!updatedKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: (updatedKey as any).id,
      name: (updatedKey as any).name,
      description: (updatedKey as any).description,
      created_at: (updatedKey as any).created_at,
      expires_at: (updatedKey as any).expires_at,
      is_active: (updatedKey as any).is_active,
      permissions: (updatedKey as any).permissions,
      last_used: (updatedKey as any).last_used,
      usage_count: (updatedKey as any).usage_count,
      key_preview: formatApiKeyForDisplay((updatedKey as any).key_hash, 8)
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/api-keys - Delete API key
export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get API key ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 })
    }
    
    // Delete API key
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id as any)
      .eq('created_by', user.id as any) // Ensure user owns the key
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'API key deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 