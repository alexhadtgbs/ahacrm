# CCaaS Integration Guide

This document provides comprehensive guidance for integrating ClínicaCRM with Contact Center as a Service (CCaaS) platforms for screen pop functionality.

## Overview

ClínicaCRM provides a dedicated API endpoint for CCaaS screen pop functionality that allows contact center agents to automatically retrieve patient case information when a call comes in, using the caller's phone number.

## API Endpoint

### Phone Lookup for Screen Pop

**Endpoint:** `/api/lookup`  
**Methods:** GET, POST  
**Authentication:** API Key required  
**Purpose:** Lookup patient case by phone number for CCaaS screen pop

#### GET Method

```http
GET /api/lookup?phone=+391234567890
```

#### POST Method

```http
POST /api/lookup
Content-Type: application/json

{
  "phone": "+391234567890"
}
```

## Authentication

All API calls require authentication using one of these methods:

### API Key Authentication (Recommended for CCaaS)

```http
x-api-key: your-api-key-here
```

### Bearer Token Authentication

```http
Authorization: Bearer your-bearer-token
```

## Response Format

### Successful Response (200 OK)

```json
{
  "found": true,
  "case_id": "9",
  "patient": {
    "name": "Antonio Dorato",
    "phone": "+39 06 2222 4444",
    "home_phone": "+39 06 2222 4444",
    "cell_phone": "+39 333 222 4444",
    "email": "antonio.dorato@email.com"
  },
  "case": {
    "status": "APPUNTAMENTO",
    "clinic": "Centro Oculistico Roma",
    "treatment": "SMILE Surgery",
    "disposition": "SMILE evaluation",
    "outcome": "Professional athlete",
    "created_at": "2025-07-08T16:57:06.836704+00:00",
    "follow_up_date": "2025-07-12T16:57:06.836704+00:00"
  },
  "screen_pop_url": "https://crm-gules-six.vercel.app/it/cases/9",
  "phone_searched": "+39 06 2222 4444"
}
```

### No Case Found (404 Not Found)

```json
{
  "found": false,
  "message": "No case found for phone number: +391234567890",
  "phone": "+391234567890"
}
```

### Error Responses

#### Missing Phone Number (400 Bad Request)

```json
{
  "error": "Phone number is required",
  "message": "Please provide a phone number in the query parameter: ?phone=+391234567890"
}
```

#### Authentication Error (401 Unauthorized)

```json
{
  "error": "Unauthorized"
}
```

## CCaaS Integration Examples

### 1. Genesys Cloud Integration

```javascript
// Genesys Cloud screen pop integration
function handleIncomingCall(callData) {
  const phoneNumber = callData.from;
  
  fetch(`https://crm-gules-six.vercel.app/api/lookup?phone=${encodeURIComponent(phoneNumber)}`, {
    method: 'GET',
    headers: {
      'x-api-key': 'your-api-key-here',
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.found) {
      // Open screen pop with case information
      openScreenPop({
        caseId: data.case_id,
        patientName: data.patient.name,
        caseStatus: data.case.status,
        clinic: data.case.clinic,
        treatment: data.case.treatment,
        screenPopUrl: data.screen_pop_url
      });
    } else {
      // No case found - show new lead form
      showNewLeadForm(phoneNumber);
    }
  })
  .catch(error => {
    console.error('Screen pop lookup failed:', error);
  });
}
```

### 2. Amazon Connect Integration

```javascript
// Amazon Connect Lambda function for screen pop
exports.handler = async (event) => {
  const phoneNumber = event.Details.Parameters.CustomerPhoneNumber;
  
  try {
    const response = await fetch(`https://crm-gules-six.vercel.app/api/lookup`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CRM_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: phoneNumber
      })
    });
    
    const data = await response.json();
    
    if (data.found) {
      return {
        statusCode: 200,
        body: {
          caseFound: true,
          caseId: data.case_id,
          patientName: data.patient.name,
          caseStatus: data.case.status,
          clinic: data.case.clinic,
          treatment: data.case.treatment,
          screenPopUrl: data.screen_pop_url
        }
      };
    } else {
      return {
        statusCode: 200,
        body: {
          caseFound: false,
          message: data.message
        }
      };
    }
  } catch (error) {
    console.error('Screen pop lookup failed:', error);
    return {
      statusCode: 500,
      body: {
        error: 'Screen pop lookup failed'
      }
    };
  }
};
```

### 3. Twilio Flex Integration

```javascript
// Twilio Flex screen pop integration
function handleIncomingCall(context) {
  const phoneNumber = context.task.attributes.from;
  
  fetch(`https://crm-gules-six.vercel.app/api/lookup?phone=${encodeURIComponent(phoneNumber)}`, {
    method: 'GET',
    headers: {
      'x-api-key': 'your-api-key-here'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.found) {
      // Update task attributes with case information
      context.task.setAttributes({
        ...context.task.attributes,
        caseId: data.case_id,
        patientName: data.patient.name,
        caseStatus: data.case.status,
        clinic: data.case.clinic,
        treatment: data.case.treatment,
        screenPopUrl: data.screen_pop_url
      });
      
      // Open screen pop
      openScreenPop(data);
    }
  });
}
```

### 4. Five9 Integration

```javascript
// Five9 screen pop integration
function onCallReceived(callData) {
  const phoneNumber = callData.ani; // Automatic Number Identification
  
  fetch(`https://crm-gules-six.vercel.app/api/lookup`, {
    method: 'POST',
    headers: {
      'x-api-key': 'your-api-key-here',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone: phoneNumber
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.found) {
      // Trigger screen pop with case data
      five9.screenPop({
        url: data.screen_pop_url,
        data: {
          caseId: data.case_id,
          patientName: data.patient.name,
          caseStatus: data.case.status,
          clinic: data.case.clinic,
          treatment: data.case.treatment
        }
      });
    }
  });
}
```

## Phone Number Search Logic

The lookup endpoint searches across all phone number fields:

1. **Primary Phone** (`phone`)
2. **Home Phone** (`home_phone`) 
3. **Cell Phone** (`cell_phone`)

The search is case-insensitive and returns the most recent case if multiple matches are found.

## Screen Pop URL

The `screen_pop_url` field provides a direct link to open the case in the CRM:

```
https://crm-gules-six.vercel.app/it/cases/{case_id}
```

This URL can be used to:
- Open the case in a new tab/window
- Embed the case view in an iframe
- Redirect the agent to the case details

## Error Handling

### Recommended Error Handling

```javascript
async function lookupCase(phoneNumber) {
  try {
    const response = await fetch(`https://crm-gules-six.vercel.app/api/lookup?phone=${encodeURIComponent(phoneNumber)}`, {
      method: 'GET',
      headers: {
        'x-api-key': 'your-api-key-here'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        // No case found - this is normal
        return { found: false };
      } else if (response.status === 401) {
        throw new Error('Authentication failed - check API key');
      } else if (response.status === 400) {
        throw new Error('Invalid phone number format');
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('Screen pop lookup failed:', error);
    // Handle gracefully - don't block the call
    return { found: false, error: error.message };
  }
}
```

## Performance Considerations

### Response Time
- Average response time: < 200ms
- 99th percentile: < 500ms
- Recommended timeout: 2 seconds

### Rate Limiting
- Default limit: 1000 requests per minute per API key
- Contact support for higher limits

### Caching
Consider implementing client-side caching for frequently called numbers:

```javascript
const phoneCache = new Map();

async function lookupCaseWithCache(phoneNumber) {
  // Check cache first
  if (phoneCache.has(phoneNumber)) {
    const cached = phoneCache.get(phoneNumber);
    if (Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached.data;
    }
  }
  
  // Fetch from API
  const data = await lookupCase(phoneNumber);
  
  // Cache the result
  phoneCache.set(phoneNumber, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

## Testing

### Test Phone Numbers

Use these test phone numbers to verify your integration:

- `+39 06 2222 4444` - Returns case data
- `+39 123 456 7890` - Returns "not found"

### Test Script

```bash
# Test successful lookup
curl -X GET "https://crm-gules-six.vercel.app/api/lookup?phone=%2B3906%202222%204444" \
  -H "x-api-key: your-api-key-here"

# Test not found
curl -X GET "https://crm-gules-six.vercel.app/api/lookup?phone=%2B391234567890" \
  -H "x-api-key: your-api-key-here"

# Test POST method
curl -X POST "https://crm-gules-six.vercel.app/api/lookup" \
  -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+39 06 2222 4444"}'
```

## Security Best Practices

1. **API Key Management**
   - Store API keys securely (environment variables, secret management)
   - Rotate keys regularly
   - Use different keys for different environments

2. **HTTPS Only**
   - Always use HTTPS for API calls
   - Never send API keys over HTTP

3. **Error Handling**
   - Don't expose API keys in error logs
   - Handle errors gracefully without blocking calls

4. **Rate Limiting**
   - Implement client-side rate limiting
   - Monitor API usage

## Support

For technical support or questions about CCaaS integration:

- **Email:** support@clinicacrm.com
- **Documentation:** https://crm-gules-six.vercel.app/api/docs
- **API Status:** Check the `/api/docs` endpoint for current status

## Changelog

### v1.0.0 (Current)
- Initial CCaaS screen pop API
- Support for GET and POST methods
- Phone number search across all fields
- Comprehensive error handling
- Swagger documentation 