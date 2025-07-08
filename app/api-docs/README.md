# ClínicaCRM API Documentation

## Overview

This page provides interactive API documentation for the ClínicaCRM platform. The documentation is powered by Swagger UI and allows you to:

- **Explore Endpoints**: View all available API endpoints
- **Test Requests**: Make actual API calls directly from the browser
- **View Schemas**: Understand the data structures used by the API
- **Download Spec**: Export the OpenAPI specification

## Available Endpoints

### Cases Management
- `GET /api/cases` - Retrieve all cases with optional filtering
- `POST /api/cases` - Create a new case
- `PUT /api/cases` - Update a case (full update)
- `PATCH /api/cases` - Update a case (partial update)
- `DELETE /api/cases/delete` - Delete a case by ID

## Authentication

The API supports two authentication methods:

### 1. Session-based Authentication (Browser Requests)
For requests made from web browsers:
1. First, authenticate through the web interface at `/it/login` or `/es/login`
2. The API will automatically use your session cookies for authentication
3. This method is used when accessing the API from the web application

### 2. API Key Authentication (Programmatic Access)
For external applications and API clients:

#### Setting up API Key
1. Add your API key to the environment variables:
   ```env
   API_KEY=your-secret-api-key-here
   ```

#### Using API Key
You can provide the API key in two ways:

**Option 1: x-api-key header**
```bash
curl -X GET "http://localhost:3000/api/cases" \
  -H "x-api-key: your-secret-api-key-here"
```

**Option 2: Bearer token**
```bash
curl -X GET "http://localhost:3000/api/cases" \
  -H "Authorization: Bearer your-secret-api-key-here"
```

#### Security Notes
- API keys are required for all non-browser requests
- Keep your API key secure and never expose it in client-side code
- The API automatically detects browser requests and skips API key validation
- For production, use a strong, randomly generated API key

## Usage Examples

### Get All Cases
```bash
curl -X GET "http://localhost:3000/api/cases" \
  -H "x-api-key: your-secret-api-key-here"
```

### Get Cases with Filters
```bash
curl -X GET "http://localhost:3000/api/cases?status=IN_CORSO&channel=WEB" \
  -H "x-api-key: your-secret-api-key-here"
```

### Create a New Case
```bash
curl -X POST "http://localhost:3000/api/cases" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-here" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "channel": "WEB",
    "origin": "Website Contact Form",
    "clinic": "Main Clinic"
  }'
```

### Update a Case
```bash
curl -X PATCH "http://localhost:3000/api/cases" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-here" \
  -d '{
    "id": 1,
    "status": "APPUNTAMENTO",
    "outcome": "Appointment scheduled for next week"
  }'
```

### Delete a Case
```bash
curl -X DELETE "http://localhost:3000/api/cases/delete?id=1" \
  -H "x-api-key: your-secret-api-key-here"
```

## Data Models

### Case Object
```json
{
  "id": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "assigned_to": "uuid-of-user",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "channel": "WEB",
  "origin": "Website Contact Form",
  "status": "IN_CORSO",
  "outcome": "Initial contact made",
  "clinic": "Main Clinic",
  "treatment": "LASIK",
  "promotion": "Spring Special",
  "follow_up_date": "2024-01-20T14:00:00Z",
  "dialer_campaign_tag": "Q1-Follow-Up"
}
```

### Status Values
- `IN_CORSO` - In Progress
- `APPUNTAMENTO` - Appointment Scheduled
- `CHIUSO` - Closed

### Channel Values
- `WEB` - Website
- `FACEBOOK` - Facebook
- `INFLUENCER` - Influencer

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a message explaining the issue:

```json
{
  "error": "Case not found"
}
```

## Rate Limiting

Currently, there are no rate limits implemented. However, please use the API responsibly and avoid making excessive requests.

## Testing Results

### ✅ Working Endpoints

#### GET /api/cases
- **Status**: ✅ Fully Working
- **Functionality**: Retrieves all cases with optional filtering
- **Tested**: Basic retrieval, status filtering (`?status=IN_CORSO`)
- **Response**: Proper JSON with all case fields

#### POST /api/cases
- **Status**: ✅ Fully Working
- **Functionality**: Creates new cases
- **Tested**: Case creation with required fields
- **Response**: Returns created case with generated ID and timestamp

#### PATCH /api/cases
- **Status**: ✅ Fully Working
- **Functionality**: Partial case updates
- **Tested**: Status updates, field modifications
- **Response**: Returns updated case data

#### Swagger Documentation
- **Status**: ✅ Fully Working
- **Endpoints**: `/api/docs` (OpenAPI spec), `/api-docs` (Interactive UI)
- **Features**: Complete API documentation with authentication schemes

### ⚠️ Known Issues

#### DELETE /api/cases/delete
- **Status**: ⚠️ Needs Fixing
- **Issue**: Returns HTML instead of JSON response
- **Impact**: Delete functionality not working properly
- **Workaround**: Use database management tools for deletions

#### API Key Authentication
- **Status**: ⚠️ Partially Working
- **Issue**: Environment variable not being picked up by dev server
- **Solution**: Add `API_KEY=your-secret-key` to `.env.local` and restart server
- **Current**: API works without validation (development mode)

## PowerShell Testing Examples

### Get All Cases
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/cases" -Method GET -Headers @{"x-api-key"="your-secret-key"; "User-Agent"="API-Client/1.0"}
```

### Filter Cases by Status
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/cases?status=IN_CORSO" -Method GET -Headers @{"x-api-key"="your-secret-key"; "User-Agent"="API-Client/1.0"}
```

### Create New Case
```powershell
$body = '{"first_name":"Test","last_name":"User","phone":"+39 999 888 7777","email":"test@example.com","channel":"WEB","origin":"API Test","clinic":"Test Clinic"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/cases" -Method POST -Body $body -ContentType "application/json" -Headers @{"x-api-key"="your-secret-key"; "User-Agent"="API-Client/1.0"}
```

### Update Case Status
```powershell
$updateBody = '{"id":1,"status":"APPUNTAMENTO","outcome":"Appointment scheduled"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/cases" -Method PATCH -Body $updateBody -ContentType "application/json" -Headers @{"x-api-key"="your-secret-key"; "User-Agent"="API-Client/1.0"}
```

## Development Setup

### Environment Variables
Create a `.env.local` file in your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
API_KEY=your-secret-api-key-here
```

### Testing Authentication
1. Set the `API_KEY` environment variable
2. Restart the development server: `npm run dev`
3. Test with invalid API key to verify 401 responses
4. Test with valid API key to verify successful requests

## Support

For questions or issues with the API:

1. Check the interactive documentation below
2. Review the error messages returned by the API
3. Check the application logs for more details
4. Contact the development team

---

**Note**: This documentation is automatically generated from the OpenAPI specification. The interactive documentation below provides the most up-to-date information about the API. 