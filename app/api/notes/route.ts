import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { withApiKeyAuth } from '@/lib/api-auth'

// GET /api/notes?case_id=123 - Get notes for a specific case
export const GET = withApiKeyAuth(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('case_id')
    
    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 })
    }
    
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data: notes, error } = await supabase
      .from('notes')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('case_id', parseInt(caseId) as any)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }
    
    return NextResponse.json(notes)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST /api/notes - Create a new note
export const POST = withApiKeyAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { case_id, content } = body
    
    if (!case_id || !content) {
      return NextResponse.json({ error: 'Case ID and content are required' }, { status: 400 })
    }
    
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        case_id: parseInt(case_id) as any,
        user_id: user.id as any,
        content: content.trim()
      } as any)
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
    }
    
    return NextResponse.json(note)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PUT /api/notes - Update a note
export const PUT = withApiKeyAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { id, content } = body
    
    if (!id || !content) {
      return NextResponse.json({ error: 'Note ID and content are required' }, { status: 400 })
    }
    
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: note, error } = await supabase
      .from('notes')
      .update({ content: content.trim() } as any)
      .eq('id', parseInt(id) as any)
      .eq('user_id', user.id as any) // Ensure user owns the note
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
    }
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 })
    }
    
    return NextResponse.json(note)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE /api/notes?id=123 - Delete a note
export const DELETE = withApiKeyAuth(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }
    
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', parseInt(id) as any)
      .eq('user_id', user.id as any) // Ensure user owns the note
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}) 