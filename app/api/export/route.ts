import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { CaseFilters } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const filters: CaseFilters = body.filters || {}

    // Build the query based on filters
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    let query = supabase
      .from('cases')
      .select(`
        *,
        profiles!cases_assigned_to_fkey(full_name)
      `)

    // Apply filters
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    if (filters.status) {
      query = query.eq('status', filters.status as any)
    }

    if (filters.channel) {
      query = query.eq('channel', filters.channel as any)
    }

    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to as any)
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    const { data: cases, error } = await query

    if (error) {
      console.error('Error fetching cases for export:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cases' },
        { status: 500 }
      )
    }

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'First Name',
      'Last Name',
      'Phone',
      'Email',
      'Channel',
      'Origin',
      'Status',
      'Outcome',
      'Clinic',
      'Treatment',
      'Promotion',
      'Created At',
      'Follow Up Date',
      'Assigned To',
      'Dialer Campaign Tag'
    ]

    const csvRows = (cases as any[] | undefined)?.map(caseItem => [
      caseItem.id,
      caseItem.first_name,
      caseItem.last_name,
      caseItem.phone,
      caseItem.email || '',
      caseItem.channel,
      caseItem.origin,
      caseItem.status,
      caseItem.outcome || '',
      caseItem.clinic,
      caseItem.treatment || '',
      caseItem.promotion || '',
      caseItem.created_at,
      caseItem.follow_up_date || '',
      caseItem.profiles?.full_name || '',
      caseItem.dialer_campaign_tag || ''
    ]) || []

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Return CSV as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="cases-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error in export API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for testing with mock data
export async function GET() {
  try {
    const mockCases = [
      {
        id: 1,
        first_name: 'Mario',
        last_name: 'Rossi',
        phone: '+39 123 456 7890',
        email: 'mario.rossi@email.com',
        channel: 'WEB',
        origin: 'Website Contact Form',
        status: 'IN_CORSO',
        outcome: 'Interested in LASIK',
        clinic: 'Centro Oculistico Milano',
        treatment: 'LASIK Surgery',
        promotion: 'Spring Special',
        created_at: '2024-01-15T10:30:00Z',
        follow_up_date: '2024-01-20T14:00:00Z',
        assigned_to: 'John Doe',
        dialer_campaign_tag: 'Q1-Follow-Up'
      }
    ]

    const csvHeaders = [
      'ID',
      'First Name',
      'Last Name',
      'Phone',
      'Email',
      'Channel',
      'Origin',
      'Status',
      'Outcome',
      'Clinic',
      'Treatment',
      'Promotion',
      'Created At',
      'Follow Up Date',
      'Assigned To',
      'Dialer Campaign Tag'
    ]

    const csvRows = mockCases.map(caseItem => [
      caseItem.id,
      caseItem.first_name,
      caseItem.last_name,
      caseItem.phone,
      caseItem.email,
      caseItem.channel,
      caseItem.origin,
      caseItem.status,
      caseItem.outcome,
      caseItem.clinic,
      caseItem.treatment,
      caseItem.promotion,
      caseItem.created_at,
      caseItem.follow_up_date,
      caseItem.assigned_to,
      caseItem.dialer_campaign_tag
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="cases-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error in export API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 