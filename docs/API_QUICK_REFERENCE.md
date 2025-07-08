# ClínicaCRM API Quick Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication

### API Key (Programmatic Access)
```bash
# Header method
-H "x-api-key: your-secret-key"

# Bearer token method
-H "Authorization: Bearer your-secret-key"
```

### Session (Browser Access)
- Automatically handled by cookies
- No additional headers required

## Endpoints

### GET /api/cases
**Retrieve all cases with optional filtering**

```bash
# Get all cases
curl -X GET "http://localhost:3000/api/cases" \
  -H "x-api-key: your-secret-key"

# Filter by status
curl -X GET "http://localhost:3000/api/cases?status=IN_CORSO" \
  -H "x-api-key: your-secret-key"

# Filter by channel
curl -X GET "http://localhost:3000/api/cases?channel=WEB" \
  -H "x-api-key: your-secret-key"

# Search by name/email/phone
curl -X GET "http://localhost:3000/api/cases?search=mario" \
  -H "x-api-key: your-secret-key"

# Date range filter
curl -X GET "http://localhost:3000/api/cases?date_from=2024-01-01&date_to=2024-12-31" \
  -H "x-api-key: your-secret-key"
```

**Query Parameters:**
- `status`: IN_CORSO, APPUNTAMENTO, CHIUSO
- `channel`: WEB, FACEBOOK, INFLUENCER
- `search`: Text search in first_name, last_name, email, phone
- `date_from`: Filter from date (ISO format)
- `date_to`: Filter until date (ISO format)

### POST /api/cases
**Create new case**

```bash
curl -X POST "http://localhost:3000/api/cases" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+39 123 456 7890",
    "email": "john@example.com",
    "channel": "WEB",
    "origin": "Website Contact Form",
    "clinic": "Main Clinic",
    "treatment": "LASIK",
    "promotion": "Spring Special"
  }'
```

**Required Fields:**
- `first_name`
- `last_name`
- `phone`
- `channel`
- `origin`
- `clinic`

### PATCH /api/cases
**Partial case update**

```bash
curl -X PATCH "http://localhost:3000/api/cases" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -d '{
    "id": 1,
    "status": "APPUNTAMENTO",
    "outcome": "Appointment scheduled for next week"
  }'
```

**Required Fields:**
- `id` (case ID to update)

### PUT /api/cases
**Full case update**

```bash
curl -X PUT "http://localhost:3000/api/cases" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -d '{
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+39 123 456 7890",
    "email": "john@example.com",
    "channel": "WEB",
    "origin": "Website Contact Form",
    "status": "APPUNTAMENTO",
    "outcome": "Appointment scheduled",
    "clinic": "Main Clinic",
    "treatment": "LASIK",
    "promotion": "Spring Special",
    "follow_up_date": "2024-01-20T14:00:00Z",
    "dialer_campaign_tag": "Q1-Follow-Up"
  }'
```

**Required Fields:**
- `id` (case ID to update)
- All other case fields

### DELETE /api/cases/delete
**Delete case by ID**

```bash
curl -X DELETE "http://localhost:3000/api/cases/delete?id=1" \
  -H "x-api-key: your-secret-key"
```

**Query Parameters:**
- `id`: Case ID to delete

**⚠️ Note:** Currently returns HTML instead of JSON (needs fixing)

## Data Models

### Case Object
```json
{
  "id": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "assigned_to": "uuid-of-user",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+39 123 456 7890",
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

## Error Responses

### 400 Bad Request
```json
{
  "error": "Case ID is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key. Please provide a valid x-api-key header or Bearer token."
}
```

### 404 Not Found
```json
{
  "error": "Case not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch cases"
}
```

## PowerShell Examples

### Get All Cases
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/cases" -Method GET -Headers @{"x-api-key"="your-secret-key"; "User-Agent"="API-Client/1.0"}
```

### Create Case
```powershell
$body = '{"first_name":"Test","last_name":"User","phone":"+39 999 888 7777","email":"test@example.com","channel":"WEB","origin":"API Test","clinic":"Test Clinic"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/cases" -Method POST -Body $body -ContentType "application/json" -Headers @{"x-api-key"="your-secret-key"; "User-Agent"="API-Client/1.0"}
```

### Update Case
```powershell
$updateBody = '{"id":1,"status":"APPUNTAMENTO","outcome":"Appointment scheduled"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/cases" -Method PATCH -Body $updateBody -ContentType "application/json" -Headers @{"x-api-key"="your-secret-key"; "User-Agent"="API-Client/1.0"}
```

## Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI Spec**: http://localhost:3000/api/docs

### Additional Resources
- [API Testing Guide](API_TESTING_GUIDE.md)
- [Full Documentation](README.md)

## Environment Setup

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
API_KEY=your-secret-api-key-here
```

### Testing Authentication
1. Set `API_KEY` in `.env.local`
2. Restart development server: `npm run dev`
3. Test with invalid API key to verify 401 responses

## Status Summary

| Endpoint | Status | Notes |
|----------|--------|-------|
| GET /api/cases | ✅ Working | Full filtering support |
| POST /api/cases | ✅ Working | Creates cases successfully |
| PATCH /api/cases | ✅ Working | Partial updates work |
| PUT /api/cases | ✅ Working | Full updates work |
| DELETE /api/cases/delete | ⚠️ Needs Fix | Returns HTML instead of JSON |
| Authentication | ⚠️ Partial | Needs environment setup |

## Support

For issues or questions:
1. Check the interactive documentation at `/api-docs`
2. Review error messages in API responses
3. Check application logs
4. Refer to the [API Testing Guide](API_TESTING_GUIDE.md) 