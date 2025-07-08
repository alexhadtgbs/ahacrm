# API Key Management System

## Overview

The ClínicaCRM API Key Management System provides secure, user-controlled API access for programmatic integration. Users can generate, manage, and track API keys through both the web interface and REST API.

## Features

- **Secure Key Generation**: Multiple key types (secure, readable, prefixed)
- **User Management**: Each user can manage their own API keys
- **Permission Control**: Granular permissions (read, write, admin)
- **Expiration Support**: Optional key expiration dates
- **Usage Tracking**: Monitor key usage and last access
- **Web Interface**: User-friendly management dashboard
- **REST API**: Programmatic key management

## Key Types

### 1. Secure Keys (Default)
- **Format**: Base64 encoded, 32 bytes
- **Example**: `dGVzdC1rZXktZm9yLWRldmVsb3BtZW50LXB1cnBvc2VzLW9ubHk=`
- **Use Case**: Production applications, maximum security

### 2. Readable Keys
- **Format**: Hexadecimal, 16 bytes
- **Example**: `a1b2c3d4e5f67890`
- **Use Case**: Development, easier to read and debug

### 3. Prefixed Keys
- **Format**: `clinicacrm_` + hexadecimal
- **Example**: `clinicacrm_a1b2c3d4e5f67890`
- **Use Case**: Easy identification, development/testing

## Security Features

### Key Storage
- API keys are **never stored in plain text**
- Keys are hashed using SHA-256 before storage
- Only key hashes are stored in the database

### Authentication Flow
1. Client sends API key in request header
2. Server hashes the provided key
3. Server compares hash with stored hash
4. If match found, validates permissions and expiration
5. Updates usage statistics on successful authentication

### Row Level Security (RLS)
- Users can only access their own API keys
- Admin functionality available with role-based access (optional)
- Database-level security policies enforce access control

**Note**: Admin access requires adding a `role` column to the `profiles` table. See `database/add_role_column.sql` for the migration.

## Database Schema

### Setup Instructions

1. **Basic Setup** (User-only access):
   ```sql
   -- Run the main schema
   \i database/api_keys_schema.sql
   ```

2. **Admin Setup** (Optional - for admin access to all keys):
   ```sql
   -- Add role column to profiles
   \i database/add_role_column.sql
   
   -- Uncomment admin policies in api_keys_schema.sql and run them
   ```

### api_keys Table
```sql
CREATE TABLE api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA256 hash
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    permissions TEXT[] DEFAULT ARRAY['read', 'write'],
    last_used TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0
);
```

### Database Functions
- `is_api_key_valid(api_key_hash)` - Validates key and updates usage
- `get_api_key_permissions(api_key_hash)` - Returns key permissions
- `update_api_key_usage(api_key_hash)` - Updates usage statistics

## Web Interface

### Access
Navigate to `/api-keys` in your browser after logging in.

### Features
- **List API Keys**: View all your API keys with usage statistics
- **Generate New Key**: Create keys with custom settings
- **Key Management**: Activate/deactivate, update, delete keys
- **Key Preview**: See partial key hash for identification
- **Usage Tracking**: Monitor usage count and last access

### Key Generation Form
- **Name**: Required identifier for the key
- **Description**: Optional notes about key usage
- **Expiration**: Optional days until key expires
- **Key Type**: Choose from secure, readable, or prefixed
- **Permissions**: Select required permissions

## REST API Endpoints

### Authentication
All API key management endpoints require user authentication (session-based, not API key).

### Endpoints

#### GET /api/api-keys
List all API keys for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Production API Key",
    "description": "For production integration",
    "created_at": "2024-01-01T00:00:00Z",
    "expires_at": "2024-12-31T23:59:59Z",
    "is_active": true,
    "permissions": ["read", "write"],
    "last_used": "2024-01-15T10:30:00Z",
    "usage_count": 150,
    "key_preview": "a1b2c3d4...e5f67890"
  }
]
```

#### POST /api/api-keys
Generate a new API key.

**Request:**
```json
{
  "name": "New API Key",
  "description": "Optional description",
  "expiresInDays": 365,
  "permissions": ["read", "write"],
  "keyType": "secure"
}
```

**Response:**
```json
{
  "id": "uuid",
  "key": "dGVzdC1rZXktZm9yLWRldmVsb3BtZW50LXB1cnBvc2VzLW9ubHk=",
  "name": "New API Key",
  "description": "Optional description",
  "created_at": "2024-01-01T00:00:00Z",
  "expires_at": "2024-12-31T23:59:59Z",
  "permissions": ["read", "write"],
  "message": "API key created successfully. Please save this key securely - it will not be shown again."
}
```

#### PUT /api/api-keys
Update an existing API key.

**Request:**
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": false,
  "permissions": ["read"],
  "expiresInDays": 30
}
```

#### DELETE /api/api-keys?id={id}
Delete an API key.

**Response:**
```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

## Using API Keys

### Authentication Headers
```bash
# Option 1: x-api-key header
curl -H "x-api-key: your-api-key-here" https://api.example.com/cases

# Option 2: Authorization header
curl -H "Authorization: Bearer your-api-key-here" https://api.example.com/cases
```

### Example Usage
```bash
# Get all cases
curl -H "x-api-key: your-api-key-here" \
  "http://localhost:3000/api/cases"

# Create a new case
curl -X POST -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "channel": "WEB",
    "origin": "Website Contact Form",
    "clinic": "Main Clinic"
  }' \
  "http://localhost:3000/api/cases"
```

## Best Practices

### Key Management
1. **Use descriptive names** for easy identification
2. **Set expiration dates** for temporary integrations
3. **Use minimal permissions** (principle of least privilege)
4. **Rotate keys regularly** for security
5. **Monitor usage** for unusual activity

### Security
1. **Never share API keys** in code repositories
2. **Use environment variables** to store keys
3. **Implement key rotation** procedures
4. **Monitor key usage** for security incidents
5. **Delete unused keys** promptly

### Development
1. **Use readable keys** for development
2. **Use prefixed keys** for easy identification
3. **Test with different permissions** to ensure proper access control
4. **Document key usage** in your integration

## Troubleshooting

### Common Issues

#### "Unauthorized" Error
- Check if API key is correct
- Verify key is active and not expired
- Ensure key has required permissions

#### "Key not found" Error
- Verify key format is correct
- Check if key was deleted or deactivated
- Ensure you're using the correct key

#### Permission Denied
- Check key permissions against required operation
- Verify key is active and not expired
- Contact admin if additional permissions needed

### Key Recovery
- **API keys cannot be recovered** once generated
- If you lose a key, delete it and generate a new one
- Update your integration with the new key

## Integration Examples

### JavaScript/Node.js
```javascript
const API_KEY = process.env.API_KEY;

async function fetchCases() {
  const response = await fetch('http://localhost:3000/api/cases', {
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}
```

### Python
```python
import requests
import os

API_KEY = os.getenv('API_KEY')

def fetch_cases():
    headers = {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    response = requests.get('http://localhost:3000/api/cases', headers=headers)
    response.raise_for_status()
    
    return response.json()
```

### cURL
```bash
# Set API key as environment variable
export API_KEY="your-api-key-here"

# Use in requests
curl -H "x-api-key: $API_KEY" \
  "http://localhost:3000/api/cases"
```

## Migration from Environment Variables

If you're currently using environment variable API keys:

1. **Generate new API keys** through the web interface
2. **Update your integrations** to use the new keys
3. **Test thoroughly** before removing old environment variables
4. **Remove old API_KEY** from environment variables

## Support

For issues with API key management:
1. Check the troubleshooting section above
2. Review the API documentation at `/api-docs`
3. Contact system administrator for permission issues
4. Check application logs for detailed error messages 