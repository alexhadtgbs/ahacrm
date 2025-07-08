import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { withApiKeyAuth } from '@/lib/api-auth'

export const GET = withApiKeyAuth(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const filters = Object.fromEntries(searchParams.entries())
    
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Build query with filters
    let query = supabase.from('cases').select('*')
    
    // Apply filters
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`)
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status as any)
    }
    
    if (filters.channel) {
      query = query.eq('channel', filters.channel as any)
    }
    
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to)
    }
    
    // Order by created_at descending (newest first)
    query = query.order('created_at', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withApiKeyAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data, error } = await supabase
      .from('cases')
      .insert(body)
      .select()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = withApiKeyAuth(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 })
    }
    
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', parseInt(id) as any)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PUT = withApiKeyAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 })
    }
    
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data, error } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PATCH = withApiKeyAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 })
    }
    
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data, error } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}) 