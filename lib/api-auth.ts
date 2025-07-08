import { NextRequest, NextResponse } from 'next/server'
import { hashApiKey } from './api-keys'

// API key validation function
export async function validateApiKey(request: NextRequest): Promise<boolean> {
  // Get API key from headers
  const apiKey = request.headers.get('x-api-key') || 
                 request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!apiKey) {
    return false
  }
  
  // Get the expected API key from environment variables (fallback)
  const expectedApiKey = process.env.API_KEY
  
  // If environment API key is configured, check against it first
  if (expectedApiKey && apiKey === expectedApiKey) {
    return true
  }
  
  // If no environment API key or it doesn't match, check database
  // Note: This would require database access, so for now we'll use the environment variable approach
  // In a full implementation, you would query the database here
  
  return false
}

// Middleware function to protect API routes
export function withApiKeyAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    // Skip API key validation for browser requests (session-based auth)
    const userAgent = request.headers.get('user-agent') || ''
    const isBrowserRequest = userAgent.includes('Mozilla') || 
                            userAgent.includes('Chrome') || 
                            userAgent.includes('Safari') ||
                            userAgent.includes('Edge')
    
    // If it's a browser request, allow it (uses session auth)
    if (isBrowserRequest) {
      return handler(request)
    }
    
    // For non-browser requests (API calls), validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          message: 'Invalid or missing API key. Please provide a valid x-api-key header or Bearer token.' 
        }, 
        { status: 401 }
      )
    }
    
    return handler(request)
  }
}

// Helper function to get API key from request
export function getApiKey(request: NextRequest): string | null {
  return request.headers.get('x-api-key') || 
         request.headers.get('authorization')?.replace('Bearer ', '') ||
         null
} 