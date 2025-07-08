import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { withApiKeyAuth } from '@/lib/api-auth'

export const GET = withApiKeyAuth(async (request: NextRequest) => {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Fetch only cases with status APPUNTAMENTO
    const { data: cases, error } = await supabase
      .from('cases')
      .select('*')
      .eq('status', 'APPUNTAMENTO' as any)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cases for export:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cases' },
        { status: 500 }
      )
    }

    // Get the first note for each case
    const casesWithNotes = await Promise.all(
      (cases || []).map(async (caseItem: any) => {
        const { data: notes } = await supabase
          .from('notes')
          .select('content')
          .eq('case_id', caseItem.id as any)
          .order('created_at', { ascending: true })
          .limit(1)

        return {
          ...caseItem,
          firstNote: notes && notes.length > 0 ? (notes[0] as any).content : ''
        }
      })
    )

    // CSV headers as specified
    const csvHeaders = [
      'CustID',
      'First',
      'Last',
      'Home Phone',
      'Cell Phone',
      'Notas',
      'Canal',
      'Preview'
    ]

    // Convert to CSV format with specified mapping
    const csvRows = casesWithNotes.map((caseItem: any) => [
      caseItem.id,                                    // CustID
      caseItem.first_name,                           // First
      caseItem.last_name,                            // Last
      caseItem.home_phone || '',                     // Home Phone
      caseItem.cell_phone || '',                     // Cell Phone
      caseItem.firstNote || '',                      // Notas (first note)
      caseItem.channel,                              // Canal
      'TRUE'                                         // Preview
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n')

    // Return CSV as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="appointments-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error in export API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST endpoint for backward compatibility
export const POST = withApiKeyAuth(async (request: NextRequest) => {
  // Redirect to GET for consistency
  return GET(request)
})

// GET endpoint for testing with mock data
export async function GET_mock() {
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