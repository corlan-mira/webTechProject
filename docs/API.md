# API Documentation

Complete REST API endpoint reference for the Event Attendance Monitoring System.

---

## Base URL

**Development:** `http://localhost:5000/api`  
**Production:** `https://api.yourdomain.com/api` (Phase 2)

---

## Authentication

All protected endpoints require a JWT token in the Authorization header.

### Header Format
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Example
```bash
curl -X GET http://localhost:5000/api/event-groups \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* Response payload */ },
  "meta": {
    "timestamp": "2025-11-16T10:00:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* Additional context */ }
  }
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Endpoints

### Authentication Endpoints

#### POST `/auth/register`
Register a new Event Organizer account.

**Permissions:** Public

**Request Body:**
```json
{
  "email": "john.organizer@example.com",
  "password": "SecurePassword123!",
  "name": "John Organizer"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.organizer@example.com",
    "name": "John Organizer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Validation Rules:**
- Email must be valid format and unique
- Password minimum 8 characters
- Name required (1-255 characters)

**Error Examples:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already registered",
    "details": { "field": "email" }
  }
}
```

---

#### POST `/auth/login`
Authenticate and receive JWT token.

**Permissions:** Public

**Request Body:**
```json
{
  "email": "john.organizer@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.organizer@example.com",
    "name": "John Organizer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Error Examples:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

---

#### POST `/auth/logout`
Invalidate current session (optional Phase 1).

**Permissions:** Protected (requires JWT)

**Request Body:** (empty)

**Response (204 No Content):**

---

### Event Group Endpoints

#### GET `/event-groups`
List all event groups for logged-in EO.

**Permissions:** Protected (EO only)

**Query Parameters:**
| Parameter | Type | Required | Default | Notes |
|-----------|------|----------|---------|-------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 10 | Results per page (max: 100) |
| `sortBy` | string | No | createdAt | Field to sort by |
| `sortOrder` | string | No | DESC | ASC or DESC |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Conference 2025",
      "description": "Annual technology conference",
      "eventCount": 5,
      "created_at": "2025-11-16T08:15:00Z",
      "updated_at": "2025-11-16T08:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

#### POST `/event-groups`
Create a new event group.

**Permissions:** Protected (EO only)

**Request Body:**
```json
{
  "name": "Conference 2025",
  "description": "Annual technology conference"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Conference 2025",
    "description": "Annual technology conference",
    "created_at": "2025-11-16T08:15:00Z",
    "updated_at": "2025-11-16T08:15:00Z"
  }
}
```

**Validation Rules:**
- Name required (1-255 characters)
- Description optional (max 1000 characters)

---

#### GET `/event-groups/:groupId`
Retrieve specific event group details.

**Permissions:** Protected (group owner only)

**URL Parameters:**
- `groupId` (UUID) - Event group ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Conference 2025",
    "description": "Annual technology conference",
    "eventCount": 5,
    "created_at": "2025-11-16T08:15:00Z",
    "updated_at": "2025-11-16T08:15:00Z",
    "events": [
      {
        "id": "event-1",
        "name": "Keynote",
        "state": "OPEN"
      }
    ]
  }
}
```

---

#### PUT `/event-groups/:groupId`
Update event group.

**Permissions:** Protected (group owner only)

**URL Parameters:**
- `groupId` (UUID) - Event group ID

**Request Body:**
```json
{
  "name": "Conference 2025 - Updated",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Conference 2025 - Updated",
    "description": "Updated description",
    "updated_at": "2025-11-16T09:00:00Z"
  }
}
```

---

#### DELETE `/event-groups/:groupId`
Delete event group and cascade to events.

**Permissions:** Protected (group owner only)

**URL Parameters:**
- `groupId` (UUID) - Event group ID

**Response (204 No Content):**

**Note:** Deleting a group removes all associated events and their check-ins.

---

### Event Endpoints

#### GET `/event-groups/:groupId/events`
List all events within a group.

**Permissions:** Protected (group owner only)

**URL Parameters:**
- `groupId` (UUID) - Event group ID

**Query Parameters:**
| Parameter | Type | Options |
|-----------|------|---------|
| `page` | integer | Default: 1 |
| `limit` | integer | Default: 10 |
| `state` | string | OPEN, CLOSED |
| `sortBy` | string | name, startDate, createdAt |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Keynote Session",
      "description": "Opening keynote address",
      "location": "Main Hall",
      "start_date": "2025-11-16T09:00:00Z",
      "end_date": "2025-11-16T10:30:00Z",
      "capacity": 500,
      "state": "OPEN",
      "access_code": "ABC-123-XYZ",
      "attendee_count": 42,
      "created_at": "2025-11-16T08:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

#### POST `/event-groups/:groupId/events`
Create a new event.

**Permissions:** Protected (group owner only)

**URL Parameters:**
- `groupId` (UUID) - Parent event group

**Request Body:**
```json
{
  "name": "Keynote Session",
  "description": "Opening keynote address",
  "location": "Main Hall",
  "start_date": "2025-11-16T09:00:00Z",
  "end_date": "2025-11-16T10:30:00Z",
  "capacity": 500,
  "state": "OPEN"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "group_id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Keynote Session",
    "description": "Opening keynote address",
    "location": "Main Hall",
    "start_date": "2025-11-16T09:00:00Z",
    "end_date": "2025-11-16T10:30:00Z",
    "capacity": 500,
    "state": "OPEN",
    "access_code": "ABC-123-XYZ",
    "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://app.com/checkin?code=ABC-123-XYZ",
    "created_at": "2025-11-16T08:30:00Z"
  }
}
```

**Validation Rules:**
- Name required (1-255 characters)
- end_date must be >= start_date
- capacity must be positive integer
- state must be OPEN or CLOSED

---

#### GET `/event-groups/:groupId/events/:eventId`
Retrieve specific event details.

**Permissions:** Protected (group owner only)

**URL Parameters:**
- `groupId` (UUID) - Event group ID
- `eventId` (UUID) - Event ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Keynote Session",
    "description": "Opening keynote address",
    "location": "Main Hall",
    "start_date": "2025-11-16T09:00:00Z",
    "end_date": "2025-11-16T10:30:00Z",
    "capacity": 500,
    "state": "OPEN",
    "access_code": "ABC-123-XYZ",
    "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...",
    "attendee_count": 42,
    "created_at": "2025-11-16T08:30:00Z"
  }
}
```

---

#### PUT `/event-groups/:groupId/events/:eventId`
Update event details.

**Permissions:** Protected (group owner only)

**URL Parameters:**
- `groupId` (UUID)
- `eventId` (UUID)

**Request Body:**
```json
{
  "name": "Keynote Session - Updated",
  "location": "Grand Hall",
  "state": "CLOSED"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Keynote Session - Updated",
    "location": "Grand Hall",
    "state": "CLOSED",
    "updated_at": "2025-11-16T11:00:00Z"
  }
}
```

---

#### DELETE `/event-groups/:groupId/events/:eventId`
Delete event and associated check-ins.

**Permissions:** Protected (group owner only)

**URL Parameters:**
- `groupId` (UUID)
- `eventId` (UUID)

**Response (204 No Content):**

---

### Check-In Endpoints

#### POST `/events/:eventId/check-in/text`
Participant check-in via text access code.

**Permissions:** Public

**URL Parameters:**
- `eventId` (UUID) - Event ID

**Request Body:**
```json
{
  "access_code": "ABC-123-XYZ",
  "participant_email": "jane.participant@example.com",
  "participant_name": "Jane Participant"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "event_id": "770e8400-e29b-41d4-a716-446655440002",
    "participant_email": "jane.participant@example.com",
    "participant_name": "Jane Participant",
    "check_in_method": "TEXT",
    "checked_in_at": "2025-11-16T09:15:23Z"
  },
  "meta": {
    "message": "Check-in successful!"
  }
}
```

**Validation Rules:**
- access_code required, must match event code
- participant_email required (valid email format)
- participant_name optional
- Event must be in OPEN state

**Error Examples:**
```json
{
  "success": false,
  "error": {
    "code": "EVENT_CLOSED",
    "message": "Event is not accepting check-ins"
  }
}
```

---

#### POST `/events/:eventId/check-in/qr`
Participant check-in via QR code.

**Permissions:** Public

**URL Parameters:**
- `eventId` (UUID) - Event ID

**Request Body:**
```json
{
  "qr_payload": "https://app.com/checkin?code=ABC-123-XYZ",
  "participant_email": "jane.participant@example.com",
  "participant_name": "Jane Participant"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "event_id": "770e8400-e29b-41d4-a716-446655440002",
    "participant_email": "jane.participant@example.com",
    "check_in_method": "QR",
    "checked_in_at": "2025-11-16T09:15:23Z"
  },
  "meta": {
    "message": "Check-in successful!"
  }
}
```

---

#### GET `/events/:eventId/attendance`
List all check-ins for an event.

**Permissions:** Protected (event organizer only)

**URL Parameters:**
- `eventId` (UUID) - Event ID

**Query Parameters:**
| Parameter | Type | Options |
|-----------|------|---------|
| `page` | integer | Default: 1 |
| `limit` | integer | Default: 10 |
| `method` | string | TEXT, QR |
| `sortBy` | string | checked_in_at, participant_email |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "participant_email": "jane.participant@example.com",
      "participant_name": "Jane Participant",
      "check_in_method": "TEXT",
      "checked_in_at": "2025-11-16T09:15:23Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440004",
      "participant_email": "john.attendee@example.com",
      "participant_name": "John Attendee",
      "check_in_method": "QR",
      "checked_in_at": "2025-11-16T09:16:45Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

### Export Endpoints

#### GET `/events/:eventId/attendance/export/csv`
Export attendance records as CSV file.

**Permissions:** Protected (event organizer only)

**URL Parameters:**
- `eventId` (UUID) - Event ID

**Query Parameters:**
| Parameter | Type | Notes |
|-----------|------|-------|
| `format` | string | Optional, always CSV for this endpoint |

**Response (200 OK - File Download):**
```
participant_email,participant_name,check_in_method,checked_in_at
jane.participant@example.com,Jane Participant,TEXT,2025-11-16T09:15:23Z
john.attendee@example.com,John Attendee,QR,2025-11-16T09:16:45Z
alice.smith@example.com,Alice Smith,TEXT,2025-11-16T09:20:10Z
```

**HTTP Headers:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="event-EVENTID-attendance.csv"
```

---

#### GET `/events/:eventId/attendance/export/xlsx`
Export attendance records as XLSX (Excel) file.

**Permissions:** Protected (event organizer only)

**URL Parameters:**
- `eventId` (UUID) - Event ID

**Response (200 OK - File Download):**
- Excel workbook with formatted columns
- Headers: Participant Email, Name, Check-in Method, Timestamp

**HTTP Headers:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="event-EVENTID-attendance.xlsx"
```

---

## Error Codes Reference

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `EVENT_CLOSED` | 409 | Event not accepting check-ins |
| `INVALID_CODE` | 400 | Access code invalid/expired |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Pagination

List endpoints support pagination:

**Default:**
- Page: 1
- Limit: 10 items per page
- Max limit: 100

**Example:**
```bash
GET /api/events?page=2&limit=20
```

**Response includes:**
```json
{
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

---

## Rate Limiting (Phase 2)

Planned rate limits:
- **Auth endpoints:** 5 requests/minute per IP
- **Check-in endpoints:** 10 requests/minute per IP
- **Other endpoints:** 100 requests/minute per IP

---

## Postman Collection

Example API requests for testing:

```bash
# Register
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123!",
  "name": "Test User"
}

---

# Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123!"
}

---

# Create Event Group
POST http://localhost:5000/api/event-groups
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "name": "My Event Group",
  "description": "Test group"
}

---

# Create Event
POST http://localhost:5000/api/event-groups/{groupId}/events
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "name": "My Event",
  "location": "Main Hall",
  "start_date": "2025-11-20T14:00:00Z",
  "end_date": "2025-11-20T15:30:00Z",
  "state": "OPEN"
}

---

# Text Check-In
POST http://localhost:5000/api/events/{eventId}/check-in/text
Content-Type: application/json

{
  "access_code": "ABC-123-XYZ",
  "participant_email": "participant@example.com",
  "participant_name": "Test Participant"
}

---

# Export CSV
GET http://localhost:5000/api/events/{eventId}/attendance/export/csv
Authorization: Bearer {TOKEN}
```

---

## API Versioning (Phase 2)

Future versions will use path versioning:
```
/api/v1/event-groups
/api/v2/event-groups
```

Current version is always `/api/` (v1).

---

For implementation details, see [ARCHITECTURE.md](./ARCHITECTURE.md)  
For database schema, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
