import crypto from 'crypto'

// API Key interface
export interface ApiKey {
  id: string
  key: string
  name: string
  description?: string
  created_at: Date
  expires_at?: Date
  is_active: boolean
  created_by: string
  permissions: string[]
  last_used?: Date
  usage_count: number
}

// Generate a secure API key
export function generateApiKey(): string {
  // Generate a 32-byte random key and encode as base64
  const randomBytes = crypto.randomBytes(32)
  return randomBytes.toString('base64')
}

// Generate a shorter, more readable API key (for display)
export function generateReadableApiKey(): string {
  // Generate a 16-byte key and encode as hex
  const randomBytes = crypto.randomBytes(16)
  return randomBytes.toString('hex')
}

// Generate a secure API key with prefix
export function generatePrefixedApiKey(prefix: string = 'clinicacrm'): string {
  const key = generateReadableApiKey()
  return `${prefix}_${key}`
}

// Validate API key format
export function validateApiKeyFormat(key: string): boolean {
  // Check if key follows expected format
  if (!key || key.length < 16) return false
  
  // Allow both base64 and hex formats
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/
  const hexRegex = /^[A-Fa-f0-9]+$/
  const prefixedRegex = /^[a-z]+_[A-Fa-f0-9]+$/
  
  return base64Regex.test(key) || hexRegex.test(key) || prefixedRegex.test(key)
}

// Hash API key for storage (never store plain text keys)
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

// Verify API key against hash
export function verifyApiKey(key: string, hash: string): boolean {
  const keyHash = hashApiKey(key)
  return crypto.timingSafeEqual(Buffer.from(keyHash, 'hex'), Buffer.from(hash, 'hex'))
}

// Generate API key metadata
export function generateApiKeyMetadata(name: string, createdBy: string, options: {
  description?: string
  expiresInDays?: number
  permissions?: string[]
} = {}): Omit<ApiKey, 'id' | 'key'> {
  const now = new Date()
  const expiresAt = options.expiresInDays 
    ? new Date(now.getTime() + options.expiresInDays * 24 * 60 * 60 * 1000)
    : undefined

  return {
    name,
    description: options.description,
    created_at: now,
    expires_at: expiresAt,
    is_active: true,
    created_by: createdBy,
    permissions: options.permissions || ['read', 'write'],
    usage_count: 0
  }
}

// Check if API key is expired
export function isApiKeyExpired(apiKey: ApiKey): boolean {
  if (!apiKey.expires_at) return false
  return new Date() > apiKey.expires_at
}

// Check if API key has required permissions
export function hasApiKeyPermission(apiKey: ApiKey, requiredPermission: string): boolean {
  if (!apiKey.is_active) return false
  if (isApiKeyExpired(apiKey)) return false
  return apiKey.permissions.includes(requiredPermission) || apiKey.permissions.includes('admin')
}

// Format API key for display (show only first and last few characters)
export function formatApiKeyForDisplay(key: string, visibleChars: number = 8): string {
  if (key.length <= visibleChars * 2) return key
  return `${key.substring(0, visibleChars)}...${key.substring(key.length - visibleChars)}`
}

// Generate a new API key with full metadata
export function createNewApiKey(name: string, createdBy: string, options: {
  description?: string
  expiresInDays?: number
  permissions?: string[]
  keyType?: 'secure' | 'readable' | 'prefixed'
} = {}): { key: string; metadata: Omit<ApiKey, 'id' | 'key'> } {
  let key: string
  
  switch (options.keyType) {
    case 'readable':
      key = generateReadableApiKey()
      break
    case 'prefixed':
      key = generatePrefixedApiKey()
      break
    case 'secure':
    default:
      key = generateApiKey()
      break
  }

  const metadata = generateApiKeyMetadata(name, createdBy, options)
  
  return { key, metadata }
} 