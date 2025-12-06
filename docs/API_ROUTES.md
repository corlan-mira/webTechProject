# API Routes Documentation

**Status:** ✅ COMPLETE  
**Date:** December 2025  
**API Prefix:** `/api`  
**Authentication:** JWT Bearer Token (24h expiration)

---

## 📋 Routes Overview

### Route Groups

| Route Group | Base Path | Auth Required | Purpose |
|------------|-----------|--------------|---------|
| Authentication | `/api/auth` | Partial* | User registration, login, token refresh |
| Event Groups | `/api/event-groups` | ✅ Yes | Manage event groups (EO only) |
| Events | `/api/events` | ✅ Yes** | Manage individual events |
| Attendance | `/api/attendance` | Partial* | Check-ins (public), management (protected) |

*Partial = Some routes public, some protected  
**Yes with public check-in routes within the events path

---

## 🔐 Authentication Routes

### Base URL: `/api/auth`

All authentication endpoints return a JWT token on success.

#### 1. Register User
```
POST /api/auth/register
```

**Authentication:** ❌ Not required (public)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "EO"
}
```

**Request Parameters:**
| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| name | string | ✅ Yes | 1-255 chars | User full name |
| email | string | ✅ Yes | Valid email, unique | Login email |
| password | string | ✅ Yes | Min 8 chars | User password |
| role | string | ❌ No | 'EO' or 'PARTICIPANT' | Default: 'PARTICIPANT' |

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EO",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- 400: Validation error (missing fields, invalid email, weak password)
- 409: Email already registered
- 500: Server error

---

#### 2. Login User
```
POST /api/auth/login
```

**Authentication:** ❌ Not required (public)

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | ✅ Yes | Login email |
| password | string | ✅ Yes | User password |

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EO",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- 400: Missing credentials
- 401: Invalid email or password
- 500: Server error

---

#### 3. Logout User
```
POST /api/auth/logout
```

**Authentication:** ❌ Not required (public)

**Request Body:** None

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

**Note:** In JWT-based auth, logout is primarily handled client-side by discarding the token. This endpoint is available for server-side token blacklisting in production.

---

#### 4. Refresh Token
```
POST /api/auth/refresh
```

**Authentication:** ✅ Required

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Token refreshed",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- 401: Invalid or expired token
- 500: Server error

---

## 📁 Event Groups Routes

### Base URL: `/api/event-groups`

All event group endpoints require JWT authentication.

#### 1. List Event Groups
```
GET /api/event-groups
```

**Authentication:** ✅ Required

**Query Parameters:**
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | number | 1 | - | Page number for pagination |
| limit | number | 10 | 100 | Items per page |
| search | string | - | - | Search by group name |

**Example:**
```
GET /api/event-groups?page=1&limit=10&search=conference
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Event groups retrieved successfully",
  "data": {
    "groups": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Tech Conference 2025",
        "description": "Annual technology conference",
        "created_by": "user-uuid",
        "created_at": "2025-01-15T10:30:00Z",
        "updated_at": "2025-01-15T10:30:00Z",
        "events": [
          {
            "id": "event-uuid",
            "title": "Opening Keynote",
            "state": "OPEN"
          }
        ]
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

#### 2. Create Event Group
```
POST /api/event-groups
```

**Authentication:** ✅ Required (EO recommended)

**Request Body:**
```json
{
  "name": "Tech Conference 2025",
  "description": "Annual technology conference for industry professionals"
}
```

**Request Parameters:**
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| name | string | ✅ Yes | 1-255 chars |
| description | string | ❌ No | Max 5000 chars |

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Event group created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Conference 2025",
    "description": "Annual technology conference for industry professionals",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

---

#### 3. Get Event Group
```
GET /api/event-groups/:groupId
```

**Authentication:** ✅ Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| groupId | UUID | Event group ID |

**Example:**
```
GET /api/event-groups/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Event group retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Conference 2025",
    "description": "Annual technology conference",
    "created_by": "user-uuid",
    "events": [
      {
        "id": "event-uuid-1",
        "title": "Opening Keynote",
        "start_time": "2025-12-15T09:00:00Z",
        "state": "OPEN"
      }
    ]
  }
}
```

---

#### 4. Update Event Group
```
PUT /api/event-groups/:groupId
```

**Authentication:** ✅ Required (Creator only)

**Request Body:**
```json
{
  "name": "Tech Conference 2025 - Updated",
  "description": "Updated description"
}
```

**Request Parameters:**
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| name | string | ❌ No | 1-255 chars |
| description | string | ❌ No | Max 5000 chars |

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Event group updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Conference 2025 - Updated",
    "description": "Updated description",
    "updated_at": "2025-01-15T11:00:00Z"
  }
}
```

---

#### 5. Delete Event Group
```
DELETE /api/event-groups/:groupId
```

**Authentication:** ✅ Required (Creator only)

**⚠️ WARNING:** Cascade delete - removes all events and attendance records.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Event group deleted successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## 📅 Events Routes

### Base URL: `/api/events` or `/api/event-groups/:groupId/events`

Mixed authentication - CRUD requires JWT, check-ins are public.

#### 1. List Events
```
GET /api/events
```

**Authentication:** ✅ Required

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 50) |
| state | string | - | Filter: DRAFT, OPEN, CLOSED |
| sort | string | newest | newest or oldest |

**Example:**
```
GET /api/events?page=1&limit=20&state=OPEN
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Events retrieved successfully",
  "data": {
    "events": [
      {
        "id": "event-uuid",
        "title": "Opening Keynote",
        "start_time": "2025-12-15T09:00:00Z",
        "duration_minutes": 60,
        "state": "OPEN",
        "code_text": "ABC123",
        "group": {
          "id": "group-uuid",
          "name": "Tech Conference 2025"
        }
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

#### 2. Create Event
```
POST /api/events
OR
POST /api/event-groups/:groupId/events
```

**Authentication:** ✅ Required (EO only)

**Request Body:**
```json
{
  "title": "Opening Keynote Session",
  "start_time": "2025-12-15T09:00:00Z",
  "duration_minutes": 60,
  "code_text": "ABC123"
}
```

**Request Parameters:**
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| title | string | ✅ Yes | 1-255 chars |
| start_time | ISO 8601 | ✅ Yes | Future date |
| duration_minutes | number | ✅ Yes | 1-1440 minutes |
| code_text | string | ❌ No | 4-50 chars, auto-generated if missing |

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Event created successfully",
  "data": {
    "id": "event-uuid",
    "title": "Opening Keynote Session",
    "start_time": "2025-12-15T09:00:00Z",
    "duration_minutes": 60,
    "code_text": "ABC123",
    "code_qr": "550e8400-e29b-41d4-a716-446655440000",
    "state": "OPEN"
  }
}
```

**Error Responses:**
- 400: Validation error
- 404: Group not found
- 409: Access code already in use

---

#### 3. Get Event
```
GET /api/events/:eventId
```

**Authentication:** ✅ Required

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Event retrieved successfully",
  "data": {
    "id": "event-uuid",
    "title": "Opening Keynote Session",
    "start_time": "2025-12-15T09:00:00Z",
    "duration_minutes": 60,
    "code_text": "ABC123",
    "code_qr": "550e8400-e29b-41d4-a716-446655440000",
    "state": "OPEN",
    "check_in_count": 42,
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

---

#### 4. Update Event
```
PUT /api/events/:eventId
```

**Authentication:** ✅ Required (Creator only)

**Request Body:**
```json
{
  "title": "Opening Keynote - Updated",
  "duration_minutes": 90
}
```

**Updatable Fields:**
| Parameter | Type | Constraints |
|-----------|------|-------------|
| title | string | 1-255 chars |
| start_time | ISO 8601 | Future date |
| duration_minutes | number | 1-1440 minutes |

**Note:** Cannot update state or access codes through this endpoint.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Event updated successfully",
  "data": {
    "id": "event-uuid",
    "title": "Opening Keynote - Updated",
    "duration_minutes": 90,
    "state": "OPEN"
  }
}
```

---

#### 5. Delete Event
```
DELETE /api/events/:eventId
```

**Authentication:** ✅ Required (Creator only)

**⚠️ Restriction:** Only DRAFT events can be deleted.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Event deleted successfully",
  "data": {
    "id": "event-uuid"
  }
}
```

**Error Response:**
- 409: Cannot delete non-draft event

---

#### 6. Change Event State
```
PATCH /api/events/:eventId/state
```

**Authentication:** ✅ Required (Creator only)

**Request Body:**
```json
{
  "state": "OPEN"
}
```

**Valid States:**
- OPEN: Accepting check-ins
- CLOSED: Not accepting check-ins

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Event state changed to OPEN",
  "data": {
    "id": "event-uuid",
    "state": "OPEN"
  }
}
```

---

#### 7. Text Code Check-in
```
POST /api/attendance/check-in/text
```

**Authentication:** ❌ Not required (public)

**Request Body:**
```json
{
  "code": "ABC123"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Check-in successful",
  "data": {
    "id": "attendance-uuid",
    "event_id": "event-uuid",
    "event_title": "Opening Keynote Session",
    "timestamp": "2025-12-15T09:15:00Z"
  }
}
```

**Error Responses:**
- 400: Invalid code
- 404: Event not found
- 409: Already checked in

---

#### 8. QR Code Check-in
```
POST /api/attendance/check-in/qr
```

**Authentication:** ❌ Not required (public)

**Request Body:**
```json
{
  "qr_data": "ABC123"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "QR check-in successful",
  "data": {
    "id": "attendance-uuid",
    "event_id": "event-uuid",
    "event_title": "Opening Keynote Session",
    "timestamp": "2025-12-15T09:15:00Z"
  }
}
```

---

## 👥 Attendance Routes

### Base URL: `/api/attendance`

Mixed authentication - check-ins are public, management routes require JWT.

#### 1. List Attendees
```
GET /api/attendance/events/:eventId
```

**Authentication:** ✅ Required (Event creator only)

**Query Parameters:**
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | number | 1 | - | Page number |
| limit | number | 20 | 100 | Items per page |
| sort | string | latest | - | earliest or latest |

**Example:**
```
GET /api/attendance/events/event-uuid?page=1&limit=20&sort=latest
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Attendees retrieved successfully",
  "data": {
    "attendees": [
      {
        "id": "attendance-uuid",
        "event_id": "event-uuid",
        "participant_id": "user-uuid",
        "timestamp": "2025-12-15T09:15:00Z",
        "participant": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

---

#### 2. Attendance Statistics
```
GET /api/attendance/events/:eventId/stats
```

**Authentication:** ✅ Required (Event creator only)

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Attendance statistics retrieved successfully",
  "data": {
    "event": {
      "id": "event-uuid",
      "title": "Opening Keynote Session",
      "state": "CLOSED"
    },
    "statistics": {
      "total_check_ins": 42,
      "registered_check_ins": 35,
      "anonymous_check_ins": 7,
      "check_in_rate": "83.33%"
    }
  }
}
```

---

#### 3. Export as CSV
```
GET /api/attendance/events/:eventId/export/csv
```

**Authentication:** ✅ Required (Event creator only)

**Response:** CSV file

**Columns:**
- Check-in ID
- Participant Name
- Participant Email
- Check-in Time
- Check-in Timestamp

**Headers:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="attendance-[eventId]-[timestamp].csv"
```

---

#### 4. Export as XLSX
```
GET /api/attendance/events/:eventId/export/xlsx
```

**Authentication:** ✅ Required (Event creator only)

**Response:** XLSX file (or CSV fallback)

**Note:** Currently returns CSV format. XLSX implementation pending.

---

## 🔒 Authentication & Authorization

### JWT Token Format

All protected endpoints require the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJFTyIsImlhdCI6MTczMzMwODYwMCwiZXhwIjoxNzMzMzk1MDAwfQ.abc123...
```

### Token Expiration

- **Duration:** 24 hours from issue
- **Refresh:** Use `/api/auth/refresh` endpoint
- **Revocation:** Discard on client-side (client-managed logout)

### Role-Based Access

| Operation | PARTICIPANT | EO |
|-----------|-------------|-----|
| Register/Login | ✅ | ✅ |
| Create Event Group | ❌ | ✅ |
| Manage Event Group | ❌ | ✅ (own only) |
| Create Event | ❌ | ✅ |
| Manage Event | ❌ | ✅ (own only) |
| View Attendees | ❌ | ✅ (own events only) |
| Export Attendance | ❌ | ✅ (own events only) |
| Check-in to Event | ✅ | ✅ |

---

## 📊 Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET request |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid JWT token |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email, access code, etc. |
| 500 | Server Error | Unexpected error |

---

## 🔄 Complete API Flow Examples

### User Registration and Event Creation Flow

```
1. Register User
   POST /api/auth/register
   { "name": "John", "email": "john@ex.com", "password": "...", "role": "EO" }
   ← Returns JWT token

2. Create Event Group
   POST /api/event-groups
   Headers: { Authorization: Bearer TOKEN }
   { "name": "Conference 2025" }
   ← Returns group UUID

3. Create Event
   POST /api/event-groups/{groupId}/events
   Headers: { Authorization: Bearer TOKEN }
   { "title": "Keynote", "start_time": "2025-12-15T09:00:00Z", "duration_minutes": 60 }
   ← Returns event with access codes

4. Open Event
   PATCH /api/events/{eventId}/state
   Headers: { Authorization: Bearer TOKEN }
   { "state": "OPEN" }
   ← Event ready for check-ins

5. Share Access Code or QR
   Share code_text or code_qr with participants
```

### Participant Check-in Flow

```
1. Receive Access Code or QR
   From event organizer (email, SMS, printed, etc.)

2. Check-in by Code
   POST /api/attendance/check-in/text
   { "code": "ABC123" }
   ← Check-in recorded

3. Confirmation
   Returns event details and check-in timestamp
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are in standard format (8-4-4-4-12)
- All responses include `status` and `message` fields
- List endpoints include pagination metadata
- Error responses include `status: "error"` and explanatory `message`
- Database automatically created on first run
- Migrations should be run for production deployments

---

## 📞 Troubleshooting

### Common Issues

**401 Unauthorized:**
- Check JWT token is included in Authorization header
- Verify token hasn't expired (24h validity)
- Use `/api/auth/refresh` to get new token

**404 Not Found:**
- Verify resource ID is correct
- Ensure user owns the resource
- Check parent resources exist (group before event, etc.)

**409 Conflict:**
- Email already registered → use different email
- Access code in use → use unique code
- Already checked in → can't check-in twice
- Delete event → must be in DRAFT state first

**400 Bad Request:**
- Review request body for missing/invalid fields
- Check field length constraints
- Verify date format (ISO 8601)
- Ensure numeric fields are valid numbers

---

**API Documentation Complete** ✅

