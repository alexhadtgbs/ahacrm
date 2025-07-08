import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { withApiKeyAuth } from '@/lib/api-auth'
import { generatePhoneVariations, findBestPhoneMatch } from '@/lib/phone-utils'

// GET /api/lookup?phone=+391234567890 - Lookup case by phone number for CCaaS screen pop
export const GET = withApiKeyAuth(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    
    if (!phone) {
      return NextResponse.json({ 
        error: 'Phone number is required',
        message: 'Please provide a phone number in the query parameter: ?phone=+391234567890'
      }, { status: 400 })
    }
    
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Strict normalization: remove all non-digit characters except leading +
    const normalize = (phone: string) => phone ? phone.replace(/[^\d+]/g, '') : '';
    const normalizedInput = normalize(phone);
    // Use last 7 digits for broad DB filter
    const last7 = normalizedInput.replace(/\D/g, '').slice(-7);

    // Query for any case where any phone field contains the last 7 digits
    const { data: cases, error } = await supabase
      .from('cases')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        home_phone,
        cell_phone,
        email,
        status,
        clinic,
        treatment,
        disposition,
        outcome,
        created_at,
        follow_up_date
      `)
      .or([
        `phone.ilike.%${last7}`,
        `home_phone.ilike.%${last7}`,
        `cell_phone.ilike.%${last7}`
      ].join(','))
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to lookup case' }, { status: 500 })
    }

    // In-memory strict normalized match
    const foundCase = (cases || []).find(c =>
      [c.phone, c.home_phone, c.cell_phone].some(dbPhone =>
        dbPhone && normalize(dbPhone) === normalizedInput
      )
    )

    if (!foundCase) {
      return NextResponse.json({ 
        found: false,
        message: `No case found for phone number: ${phone}`,
        phone: phone
      }, { status: 404 })
    }
    
    // Return optimized data for CCaaS screen pop
    return NextResponse.json({
      found: true,
      case_id: foundCase.id,
      patient: {
        name: `${foundCase.first_name} ${foundCase.last_name}`,
        phone: foundCase.phone,
        home_phone: foundCase.home_phone,
        cell_phone: foundCase.cell_phone,
        email: foundCase.email
      },
      case: {
        status: foundCase.status,
        clinic: foundCase.clinic,
        treatment: foundCase.treatment,
        disposition: foundCase.disposition,
        outcome: foundCase.outcome,
        created_at: foundCase.created_at,
        follow_up_date: foundCase.follow_up_date
      },
      screen_pop_url: `https://crm-gules-six.vercel.app/it/cases/${foundCase.id}`,
      phone_searched: phone
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST /api/lookup - Alternative method for phone lookup
export const POST = withApiKeyAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { phone } = body
    
    if (!phone) {
      return NextResponse.json({ 
        error: 'Phone number is required in request body',
        message: 'Please provide a phone number in the request body: {"phone": "+391234567890"}'
      }, { status: 400 })
    }
    
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Strict normalization: remove all non-digit characters except leading +
    const normalize = (phone: string) => phone ? phone.replace(/[^\d+]/g, '') : '';
    const normalizedInput = normalize(phone);
    // Use last 7 digits for broad DB filter
    const last7 = normalizedInput.replace(/\D/g, '').slice(-7);

    // Query for any case where any phone field contains the last 7 digits
    const { data: cases, error } = await supabase
      .from('cases')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        home_phone,
        cell_phone,
        email,
        status,
        clinic,
        treatment,
        disposition,
        outcome,
        created_at,
        follow_up_date
      `)
      .or([
        `phone.ilike.%${last7}`,
        `home_phone.ilike.%${last7}`,
        `cell_phone.ilike.%${last7}`
      ].join(','))
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to lookup case' }, { status: 500 })
    }

    // In-memory strict normalized match
    const foundCase = (cases || []).find(c =>
      [c.phone, c.home_phone, c.cell_phone].some(dbPhone =>
        dbPhone && normalize(dbPhone) === normalizedInput
      )
    )

    if (!foundCase) {
      return NextResponse.json({ 
        found: false,
        message: `No case found for phone number: ${phone}`,
        phone: phone
      }, { status: 404 })
    }
    
    // Return optimized data for CCaaS screen pop
    return NextResponse.json({
      found: true,
      case_id: foundCase.id,
      patient: {
        name: `${foundCase.first_name} ${foundCase.last_name}`,
        phone: foundCase.phone,
        home_phone: foundCase.home_phone,
        cell_phone: foundCase.cell_phone,
        email: foundCase.email
      },
      case: {
        status: foundCase.status,
        clinic: foundCase.clinic,
        treatment: foundCase.treatment,
        disposition: foundCase.disposition,
        outcome: foundCase.outcome,
        created_at: foundCase.created_at,
        follow_up_date: foundCase.follow_up_date
      },
      screen_pop_url: `https://crm-gules-six.vercel.app/it/cases/${foundCase.id}`,
      phone_searched: phone
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}) 