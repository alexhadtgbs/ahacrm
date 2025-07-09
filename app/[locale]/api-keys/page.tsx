'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Header } from '@/components/ui/Header'
import { getCurrentLocale } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface ApiKey {
  id: string
  name: string
  description?: string
  created_at: string
  expires_at?: string
  is_active: boolean
  permissions: string[]
  last_used?: string
  usage_count: number
  key_preview: string
}

interface NewApiKey {
  id: string
  key: string
  name: string
  description?: string
  created_at: string
  expires_at?: string
  permissions: string[]
  message: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKey, setNewKey] = useState<NewApiKey | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  const hasRedirected = useRef(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expiresInDays: '',
    permissions: ['read', 'write'],
    keyType: 'secure' as 'secure' | 'readable' | 'prefixed'
  })

  useEffect(() => {
    // Check authentication status
    if (user === null && !hasRedirected.current) {
      console.log('User not authenticated, redirecting to login...')
      hasRedirected.current = true
      const locale = getCurrentLocale()
      router.push(`/${locale}/login`)
      return
    }
    
    if (user !== undefined) {
      setAuthLoading(false)
      loadApiKeys()
    }
  }, [user, router])

  const loadApiKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/api-keys', {
        credentials: 'include' // Include cookies for authentication
      })
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data)
      } else {
        console.error('Failed to load API keys')
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      setCreating(true)
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newApiKey = await response.json()
        setNewKey(newApiKey)
        setShowCreateForm(false)
        setFormData({
          name: '',
          description: '',
          expiresInDays: '',
          permissions: ['read', 'write'],
          keyType: 'secure'
        })
        await loadApiKeys()
      } else {
        const error = await response.json()
        alert(`Error creating API key: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating API key:', error)
      alert('Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(id)
      const response = await fetch(`/api/api-keys?id=${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      })

      if (response.ok) {
        await loadApiKeys()
      } else {
        const error = await response.json()
        alert(`Error deleting API key: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting API key:', error)
      alert('Failed to delete API key')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch('/api/api-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          id,
          is_active: !currentActive,
        }),
      })

      if (response.ok) {
        await loadApiKeys()
      } else {
        const error = await response.json()
        alert(`Error updating API key: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating API key:', error)
      alert('Failed to update API key')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
          <p className="mt-2 text-gray-500">User: {user ? user.email : 'Not authenticated'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-h1 text-text-primary">API Keys</h1>
            <p className="text-text-secondary">Manage API keys for external integrations</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => window.open('/api-docs', '_blank')}>
              API Docs
            </Button>
            <Button variant="outline" onClick={() => {
              const locale = getCurrentLocale()
              router.push(`/${locale}/cases`)
            }}>
              Back to Cases
            </Button>
            <Button onClick={() => setShowCreateForm(true)}>
              Create API Key
            </Button>
          </div>
        </div>

        {/* New API Key Modal */}
        {newKey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">New API Key Generated</h2>
              <div className="bg-gray-100 p-4 rounded mb-4">
                <p className="text-sm text-gray-600 mb-2">API Key (save this securely):</p>
                <code className="text-sm break-all bg-white p-2 rounded border">
                  {newKey.key}
                </code>
              </div>
              <p className="text-sm text-red-600 mb-4">
                ⚠️ This is the only time you'll see this key. Please save it securely!
              </p>
              <div className="flex space-x-2">
                <Button onClick={() => copyToClipboard(newKey.key)}>
                  Copy Key
                </Button>
                <Button variant="outline" onClick={() => setNewKey(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create API Key Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Generate New API Key</h2>
              <form onSubmit={handleCreateApiKey} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Production API Key"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="input-field"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires in (days)
                  </label>
                  <Input
                    type="number"
                    value={formData.expiresInDays}
                    onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value })}
                    placeholder="Leave empty for no expiration"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Type
                  </label>
                  <select
                    className="input-field"
                    value={formData.keyType}
                    onChange={(e) => setFormData({ ...formData, keyType: e.target.value as any })}
                  >
                    <option value="secure">Secure (Base64, 32 bytes)</option>
                    <option value="readable">Readable (Hex, 16 bytes)</option>
                    <option value="prefixed">Prefixed (clinicacrm_hex)</option>
                  </select>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" loading={creating}>
                    Generate Key
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* API Keys List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading API keys...</p>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys found</h3>
            <p className="text-gray-600 mb-4">Generate your first API key to get started</p>
            <Button onClick={() => setShowCreateForm(true)}>
              Generate API Key
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        apiKey.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {apiKey.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {apiKey.description && (
                      <p className="text-gray-600 mb-2">{apiKey.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Key Preview:</span>
                        <p className="font-mono">{apiKey.key_preview}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p>{formatDate(apiKey.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Usage Count:</span>
                        <p>{apiKey.usage_count}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Permissions:</span>
                        <p>{apiKey.permissions.join(', ')}</p>
                      </div>
                    </div>
                    
                    {apiKey.last_used && (
                      <div className="mt-2 text-sm text-gray-500">
                        Last used: {formatDate(apiKey.last_used)}
                      </div>
                    )}
                    
                    {apiKey.expires_at && (
                      <div className="mt-2 text-sm text-gray-500">
                        Expires: {formatDate(apiKey.expires_at)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(apiKey.id, apiKey.is_active)}
                    >
                      {apiKey.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateForm(true)}
                    >
                      Regenerate
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deleting === apiKey.id}
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 