import { NextResponse } from 'next/server'

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')
  
  return NextResponse.json({
    message: 'Test endpoint working!',
    phone: phone,
    timestamp: new Date().toISOString()
  })
} 