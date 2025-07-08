import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { DialerLead } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaign_tag_filter } = body

    if (!campaign_tag_filter) {
      return NextResponse.json(
        { error: 'campaign_tag_filter is required' },
        { status: 400 }
      )
    }

    // Call the Supabase RPC function to get leads for dialer
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data, error } = await supabase.rpc('get_leads_for_dialer', {
      campaign_tag_filter
    })

    if (error) {
      console.error('Error fetching leads for dialer:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }

    const leads: DialerLead[] = (data as DialerLead[]) || []

    return NextResponse.json({
      success: true,
      leads,
      count: leads.length
    })

  } catch (error) {
    console.error('Error in dialer API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for testing
export async function GET() {
  try {
    // For testing purposes, return some mock data
    const mockLeads: DialerLead[] = [
      { record_id: 1, phone_e164: '+391234567890' },
      { record_id: 2, phone_e164: '+399876543210' }
    ]

    return NextResponse.json({
      success: true,
      leads: mockLeads,
      count: mockLeads.length
    })

  } catch (error) {
    console.error('Error in dialer API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 