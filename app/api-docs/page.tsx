'use client'

import { useEffect } from 'react'

export default function ApiDocsPage() {
  useEffect(() => {
    // Load Swagger UI CSS first
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css'
    document.head.appendChild(link)
    
    // Load Swagger UI JavaScript
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js'
    script.onload = () => {
      // Initialize Swagger UI
      const ui = (window as any).SwaggerUIBundle({
        url: '/api/docs',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          (window as any).SwaggerUIBundle.presets.apis,
          (window as any).SwaggerUIBundle.presets.standalone
        ],
        plugins: [
          (window as any).SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: 'BaseLayout',
        tryItOutEnabled: true,
        requestInterceptor: (request: any) => {
          // Add authentication headers if needed
          return request
        }
      })
    }
    document.head.appendChild(script)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">ClínicaCRM API Documentation</h1>
            <p className="text-gray-600 mt-1">
              Interactive API documentation for managing cases and patient leads
            </p>
          </div>
        </div>
      </div>
      
      <div id="swagger-ui" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"></div>
    </div>
  )
} 