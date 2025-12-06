 API Routes Documentation

Status:  COMPLETE  
Date: December   
API Prefix: `/api`  
Authentication: JWT Bearer Token (h expiration)

---

  Routes Overview

 Route Groups

| Route Group | Base Path | Auth Required | Purpose |
|------------|-----------|--------------|---------|
| Authentication | `/api/auth` | Partial | User registration, login, token refresh |
| Event Groups | `/api/event-groups` |  Yes | Manage event groups (EO only) |
| Events | `/api/events` |  Yes | Manage individual events |
| Attendance | `/api/attendance` | Partial | Check-ins (public), management (protected) |

Partial = Some routes public, some protected  
Yes with public check-in routes within the events path

---

  Authentication Routes

 Base URL: `/api/auth`

All authentication endpoints return a JWT token on success.

 . Register User
```
POST /api/auth/register
```

Authentication:  Not required (public)

Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword",
  "role": "EO"
}
```

Request Parameters:
| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| name | string |  Yes | - chars | User full name |
| email | string |  Yes | Valid email, unique | Login email |
| password | string |  Yes | Min  chars | User password |
| role | string |  No | 'EO' or 'PARTICIPANT' | Default: 'PARTICIPANT' |

Response ( Created):
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": "e-eb-d-a-",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EO",
    "token": "eyJhbGciOiJIUzINiIsInRcCIIkpXVCJ..."
  }
}
```

Error Responses:
- : Validation error (missing fields, invalid email, weak password)
- : Email already registered
- : Server error

---

 . Login User
```
POST /api/auth/login
```

Authentication:  Not required (public)

Request Body:
```json
{
  "email": "john@example.com",
  "password": "securePassword"
}
```

Request Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string |  Yes | Login email |
| password | string |  Yes | User password |

Response ( OK):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "id": "e-eb-d-a-",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EO",
    "token": "eyJhbGciOiJIUzINiIsInRcCIIkpXVCJ..."
  }
}
```

Error Responses:
- : Missing credentials
- : Invalid email or password
- : Server error

---

 . Logout User
```
POST /api/auth/logout
```

Authentication:  Not required (public)

Request Body: None

Response ( OK):
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

Note: In JWT-based auth, logout is primarily handled client-side by discarding the token. This endpoint is available for server-side token blacklisting in production.

---

 . Refresh Token
```
POST /api/auth/refresh
```

Authentication:  Required

Headers:
```
Authorization: Bearer eyJhbGciOiJIUzINiIsInRcCIIkpXVCJ...
```

Request Body: None

Response ( OK):
```json
{
  "status": "success",
  "message": "Token refreshed",
  "data": {
    "token": "eyJhbGciOiJIUzINiIsInRcCIIkpXVCJ..."
  }
}
```

Error Responses:
- : Invalid or expired token
- : Server error

---

  Event Groups Routes

 Base URL: `/api/event-groups`

All event group endpoints require JWT authentication.

 . List Event Groups
```
GET /api/event-groups
```

Authentication:  Required

Query Parameters:
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | number |  | - | Page number for pagination |
| limit | number |  |  | Items per page |
| search | string | - | - | Search by group name |

Example:
```
GET /api/event-groups?page=&limit=&search=conference
Authorization: Bearer eyJhbGciOiJIUzINiIs...
```

Response ( OK):
```json
{
  "status": "success",
  "message": "Event groups retrieved successfully",
  "data": {
    "groups": [
      {
        "id": "e-eb-d-a-",
        "name": "Tech Conference ",
        "description": "Annual technology conference",
        "created_by": "user-uuid",
        "created_at": "--T::Z",
        "updated_at": "--T::Z",
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
      "total": ,
      "page": ,
      "limit": ,
      "pages": 
    }
  }
}
```

---

 . Create Event Group
```
POST /api/event-groups
```

Authentication:  Required (EO recommended)

Request Body:
```json
{
  "name": "Tech Conference ",
  "description": "Annual technology conference for industry professionals"
}
```

Request Parameters:
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| name | string |  Yes | - chars |
| description | string |  No | Max  chars |

Response ( Created):
```json
{
  "status": "success",
  "message": "Event group created successfully",
  "data": {
    "id": "e-eb-d-a-",
    "name": "Tech Conference ",
    "description": "Annual technology conference for industry professionals",
    "created_at": "--T::Z"
  }
}
```

---

 . Get Event Group
```
GET /api/event-groups/:groupId
```

Authentication:  Required

URL Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| groupId | UUID | Event group ID |

Example:
```
GET /api/event-groups/e-eb-d-a-
Authorization: Bearer eyJhbGciOiJIUzINiIs...
```

Response ( OK):
```json
{
  "status": "success",
  "message": "Event group retrieved successfully",
  "data": {
    "id": "e-eb-d-a-",
    "name": "Tech Conference ",
    "description": "Annual technology conference",
    "created_by": "user-uuid",
    "events": [
      {
        "id": "event-uuid-",
        "title": "Opening Keynote",
        "start_time": "--T::Z",
        "state": "OPEN"
      }
    ]
  }
}
```

---

 . Update Event Group
```
PUT /api/event-groups/:groupId
```

Authentication:  Required (Creator only)

Request Body:
```json
{
  "name": "Tech Conference  - Updated",
  "description": "Updated description"
}
```

Request Parameters:
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| name | string |  No | - chars |
| description | string |  No | Max  chars |

Response ( OK):
```json
{
  "status": "success",
  "message": "Event group updated successfully",
  "data": {
    "id": "e-eb-d-a-",
    "name": "Tech Conference  - Updated",
    "description": "Updated description",
    "updated_at": "--T::Z"
  }
}
```

---

 . Delete Event Group
```
DELETE /api/event-groups/:groupId
```

Authentication:  Required (Creator only)

️ WARNING: Cascade delete - removes all events and attendance records.

Response ( OK):
```json
{
  "status": "success",
  "message": "Event group deleted successfully",
  "data": {
    "id": "e-eb-d-a-"
  }
}
```

---

  Events Routes

 Base URL: `/api/events` or `/api/event-groups/:groupId/events`

Mixed authentication - CRUD requires JWT, check-ins are public.

 . List Events
```
GET /api/events
```

Authentication:  Required

Query Parameters:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number |  | Page number |
| limit | number |  | Items per page (max ) |
| state | string | - | Filter: DRAFT, OPEN, CLOSED |
| sort | string | newest | newest or oldest |

Example:
```
GET /api/events?page=&limit=&state=OPEN
Authorization: Bearer eyJhbGciOiJIUzINiIs...
```

Response ( OK):
```json
{
  "status": "success",
  "message": "Events retrieved successfully",
  "data": {
    "events": [
      {
        "id": "event-uuid",
        "title": "Opening Keynote",
        "start_time": "--T::Z",
        "duration_minutes": ,
        "state": "OPEN",
        "code_text": "ABC",
        "group": {
          "id": "group-uuid",
          "name": "Tech Conference "
        }
      }
    ],
    "pagination": {
      "total": ,
      "page": ,
      "limit": ,
      "pages": 
    }
  }
}
```

---

 . Create Event
```
POST /api/events
OR
POST /api/event-groups/:groupId/events
```

Authentication:  Required (EO only)

Request Body:
```json
{
  "title": "Opening Keynote Session",
  "start_time": "--T::Z",
  "duration_minutes": ,
  "code_text": "ABC"
}
```

Request Parameters:
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| title | string |  Yes | - chars |
| start_time | ISO  |  Yes | Future date |
| duration_minutes | number |  Yes | - minutes |
| code_text | string |  No | - chars, auto-generated if missing |

Response ( Created):
```json
{
  "status": "success",
  "message": "Event created successfully",
  "data": {
    "id": "event-uuid",
    "title": "Opening Keynote Session",
    "start_time": "--T::Z",
    "duration_minutes": ,
    "code_text": "ABC",
    "code_qr": "e-eb-d-a-",
    "state": "OPEN"
  }
}
```

Error Responses:
- : Validation error
- : Group not found
- : Access code already in use

---

 . Get Event
```
GET /api/events/:eventId
```

Authentication:  Required

Response ( OK):
```json
{
  "status": "success",
  "message": "Event retrieved successfully",
  "data": {
    "id": "event-uuid",
    "title": "Opening Keynote Session",
    "start_time": "--T::Z",
    "duration_minutes": ,
    "code_text": "ABC",
    "code_qr": "e-eb-d-a-",
    "state": "OPEN",
    "check_in_count": ,
    "created_at": "--T::Z"
  }
}
```

---

 . Update Event
```
PUT /api/events/:eventId
```

Authentication:  Required (Creator only)

Request Body:
```json
{
  "title": "Opening Keynote - Updated",
  "duration_minutes": 
}
```

Updatable Fields:
| Parameter | Type | Constraints |
|-----------|------|-------------|
| title | string | - chars |
| start_time | ISO  | Future date |
| duration_minutes | number | - minutes |

Note: Cannot update state or access codes through this endpoint.

Response ( OK):
```json
{
  "status": "success",
  "message": "Event updated successfully",
  "data": {
    "id": "event-uuid",
    "title": "Opening Keynote - Updated",
    "duration_minutes": ,
    "state": "OPEN"
  }
}
```

---

 . Delete Event
```
DELETE /api/events/:eventId
```

Authentication:  Required (Creator only)

️ Restriction: Only DRAFT events can be deleted.

Response ( OK):
```json
{
  "status": "success",
  "message": "Event deleted successfully",
  "data": {
    "id": "event-uuid"
  }
}
```

Error Response:
- : Cannot delete non-draft event

---

 . Change Event State
```
PATCH /api/events/:eventId/state
```

Authentication:  Required (Creator only)

Request Body:
```json
{
  "state": "OPEN"
}
```

Valid States:
- OPEN: Accepting check-ins
- CLOSED: Not accepting check-ins

Response ( OK):
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

 . Text Code Check-in
```
POST /api/attendance/check-in/text
```

Authentication:  Not required (public)

Request Body:
```json
{
  "code": "ABC"
}
```

Response ( Created):
```json
{
  "status": "success",
  "message": "Check-in successful",
  "data": {
    "id": "attendance-uuid",
    "event_id": "event-uuid",
    "event_title": "Opening Keynote Session",
    "timestamp": "--T::Z"
  }
}
```

Error Responses:
- : Invalid code
- : Event not found
- : Already checked in

---

 . QR Code Check-in
```
POST /api/attendance/check-in/qr
```

Authentication:  Not required (public)

Request Body:
```json
{
  "qr_data": "ABC"
}
```

Response ( Created):
```json
{
  "status": "success",
  "message": "QR check-in successful",
  "data": {
    "id": "attendance-uuid",
    "event_id": "event-uuid",
    "event_title": "Opening Keynote Session",
    "timestamp": "--T::Z"
  }
}
```

---

  Attendance Routes

 Base URL: `/api/attendance`

Mixed authentication - check-ins are public, management routes require JWT.

 . List Attendees
```
GET /api/attendance/events/:eventId
```

Authentication:  Required (Event creator only)

Query Parameters:
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | number |  | - | Page number |
| limit | number |  |  | Items per page |
| sort | string | latest | - | earliest or latest |

Example:
```
GET /api/attendance/events/event-uuid?page=&limit=&sort=latest
Authorization: Bearer eyJhbGciOiJIUzINiIs...
```

Response ( OK):
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
        "timestamp": "--T::Z",
        "participant": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "total": ,
      "page": ,
      "limit": ,
      "pages": 
    }
  }
}
```

---

 . Attendance Statistics
```
GET /api/attendance/events/:eventId/stats
```

Authentication:  Required (Event creator only)

Response ( OK):
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
      "total_check_ins": ,
      "registered_check_ins": ,
      "anonymous_check_ins": ,
      "check_in_rate": ".%"
    }
  }
}
```

---

 . Export as CSV
```
GET /api/attendance/events/:eventId/export/csv
```

Authentication:  Required (Event creator only)

Response: CSV file

Columns:
- Check-in ID
- Participant Name
- Participant Email
- Check-in Time
- Check-in Timestamp

Headers:
```
Content-Type: text/csv
Content-Disposition: attachment; filename="attendance-[eventId]-[timestamp].csv"
```

---

 . Export as XLSX
```
GET /api/attendance/events/:eventId/export/xlsx
```

Authentication:  Required (Event creator only)

Response: XLSX file (or CSV fallback)

Note: Currently returns CSV format. XLSX implementation pending.

---

  Authentication & Authorization

 JWT Token Format

All protected endpoints require the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzINiIsInRcCIIkpXVCJ.eyJpZCIIjUMGUNDAwLWUyOWItNDFkNChNzELTQNjYNTQMDAwMCIsImVtYWlsIjoiamobkBleGFtcGxlLmNvbSIsInJvbGUiOiJFTyIsImlhdCIMTczMzMwODYwMCwiZXhwIjoxNzMzMzkMDAwfQ.abc...
```

 Token Expiration

- Duration:  hours from issue
- Refresh: Use `/api/auth/refresh` endpoint
- Revocation: Discard on client-side (client-managed logout)

 Role-Based Access

| Operation | PARTICIPANT | EO |
|-----------|-------------|-----|
| Register/Login |  |  |
| Create Event Group |  |  |
| Manage Event Group |  |  (own only) |
| Create Event |  |  |
| Manage Event |  |  (own only) |
| View Attendees |  |  (own events only) |
| Export Attendance |  |  (own events only) |
| Check-in to Event |  |  |

---

  Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
|  | OK | Successful GET request |
|  | Created | Resource created |
|  | Bad Request | Validation error |
|  | Unauthorized | Missing/invalid JWT token |
|  | Not Found | Resource doesn't exist |
|  | Conflict | Duplicate email, access code, etc. |
|  | Server Error | Unexpected error |

---

  Complete API Flow Examples

 User Registration and Event Creation Flow

```
. Register User
   POST /api/auth/register
   { "name": "John", "email": "john@ex.com", "password": "...", "role": "EO" }
   ← Returns JWT token

. Create Event Group
   POST /api/event-groups
   Headers: { Authorization: Bearer TOKEN }
   { "name": "Conference " }
   ← Returns group UUID

. Create Event
   POST /api/event-groups/{groupId}/events
   Headers: { Authorization: Bearer TOKEN }
   { "title": "Keynote", "start_time": "--T::Z", "duration_minutes":  }
   ← Returns event with access codes

. Open Event
   PATCH /api/events/{eventId}/state
   Headers: { Authorization: Bearer TOKEN }
   { "state": "OPEN" }
   ← Event ready for check-ins

. Share Access Code or QR
   Share code_text or code_qr with participants
```

 Participant Check-in Flow

```
. Receive Access Code or QR
   From event organizer (email, SMS, printed, etc.)

. Check-in by Code
   POST /api/attendance/check-in/text
   { "code": "ABC" }
   ← Check-in recorded

. Confirmation
   Returns event details and check-in timestamp
```

---

  Notes

- All timestamps are in ISO  format (UTC)
- UUIDs are in standard format (----)
- All responses include `status` and `message` fields
- List endpoints include pagination metadata
- Error responses include `status: "error"` and explanatory `message`
- Database automatically created on first run
- Migrations should be run for production deployments

---

  Troubleshooting

 Common Issues

 Unauthorized:
- Check JWT token is included in Authorization header
- Verify token hasn't expired (h validity)
- Use `/api/auth/refresh` to get new token

 Not Found:
- Verify resource ID is correct
- Ensure user owns the resource
- Check parent resources exist (group before event, etc.)

 Conflict:
- Email already registered → use different email
- Access code in use → use unique code
- Already checked in → can't check-in twice
- Delete event → must be in DRAFT state first

 Bad Request:
- Review request body for missing/invalid fields
- Check field length constraints
- Verify date format (ISO )
- Ensure numeric fields are valid numbers

---

API Documentation Complete 

