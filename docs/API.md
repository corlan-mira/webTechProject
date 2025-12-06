 API Documentation

Complete REST API endpoint reference for the Event Attendance Monitoring System.

---

 Base URL

Development: `http://localhost:/api`  
Production: `https://api.yourdomain.com/api` (Phase )

---

 Authentication

All protected endpoints require a JWT token in the Authorization header.

 Header Format
```
Authorization: Bearer YOUR_JWT_TOKEN
```

 Example
```bash
curl -X GET http://localhost:/api/event-groups \
  -H "Authorization: Bearer eyJhbGciOiJIUzINiIsInRcCIIkpXVCJ..."
```

---

 Response Format

 Success Response
```json
{
  "success": true,
  "data": { / Response payload / },
  "meta": {
    "timestamp": "--T::Z"
  }
}
```

 Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { / Additional context / }
  }
}
```

 HTTP Status Codes
| Code | Meaning |
|------|---------|
|  | OK - Request succeeded |
|  | Created - Resource created |
|  | No Content - Successful deletion |
|  | Bad Request - Invalid input |
|  | Unauthorized - Missing/invalid token |
|  | Forbidden - Insufficient permissions |
|  | Not Found - Resource not found |
|  | Conflict - Resource already exists |
|  | Internal Server Error |

---

 Endpoints

 Authentication Endpoints

 POST `/auth/register`
Register a new Event Organizer account.

Permissions: Public

Request Body:
```json
{
  "email": "john.organizer@example.com",
  "password": "SecurePassword!",
  "name": "John Organizer"
}
```

Response ( Created):
```json
{
  "success": true,
  "data": {
    "id": "e-eb-d-a-",
    "email": "john.organizer@example.com",
    "name": "John Organizer",
    "token": "eyJhbGciOiJIUzINiIsInRcCIIkpXVCJ...",
    "expiresIn": 
  }
}
```

Validation Rules:
- Email must be valid format and unique
- Password minimum  characters
- Name required (- characters)

Error Examples:
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

 POST `/auth/login`
Authenticate and receive JWT token.

Permissions: Public

Request Body:
```json
{
  "email": "john.organizer@example.com",
  "password": "SecurePassword!"
}
```

Response ( OK):
```json
{
  "success": true,
  "data": {
    "id": "e-eb-d-a-",
    "email": "john.organizer@example.com",
    "name": "John Organizer",
    "token": "eyJhbGciOiJIUzINiIsInRcCIIkpXVCJ...",
    "expiresIn": 
  }
}
```

Error Examples:
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

 POST `/auth/logout`
Invalidate current session (optional Phase ).

Permissions: Protected (requires JWT)

Request Body: (empty)

Response ( No Content):

---

 Event Group Endpoints

 GET `/event-groups`
List all event groups for logged-in EO.

Permissions: Protected (EO only)

Query Parameters:
| Parameter | Type | Required | Default | Notes |
|-----------|------|----------|---------|-------|
| `page` | integer | No |  | Page number for pagination |
| `limit` | integer | No |  | Results per page (max: ) |
| `sortBy` | string | No | createdAt | Field to sort by |
| `sortOrder` | string | No | DESC | ASC or DESC |

Response ( OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "e-eb-d-a-",
      "name": "Conference ",
      "description": "Annual technology conference",
      "eventCount": ,
      "created_at": "--T::Z",
      "updated_at": "--T::Z"
    }
  ],
  "pagination": {
    "page": ,
    "limit": ,
    "total": ,
    "totalPages": 
  }
}
```

---

 POST `/event-groups`
Create a new event group.

Permissions: Protected (EO only)

Request Body:
```json
{
  "name": "Conference ",
  "description": "Annual technology conference"
}
```

Response ( Created):
```json
{
  "success": true,
  "data": {
    "id": "e-eb-d-a-",
    "name": "Conference ",
    "description": "Annual technology conference",
    "created_at": "--T::Z",
    "updated_at": "--T::Z"
  }
}
```

Validation Rules:
- Name required (- characters)
- Description optional (max  characters)

---

 GET `/event-groups/:groupId`
Retrieve specific event group details.

Permissions: Protected (group owner only)

URL Parameters:
- `groupId` (UUID) - Event group ID

Response ( OK):
```json
{
  "success": true,
  "data": {
    "id": "e-eb-d-a-",
    "name": "Conference ",
    "description": "Annual technology conference",
    "eventCount": ,
    "created_at": "--T::Z",
    "updated_at": "--T::Z",
    "events": [
      {
        "id": "event-",
        "name": "Keynote",
        "state": "OPEN"
      }
    ]
  }
}
```

---

 PUT `/event-groups/:groupId`
Update event group.

Permissions: Protected (group owner only)

URL Parameters:
- `groupId` (UUID) - Event group ID

Request Body:
```json
{
  "name": "Conference  - Updated",
  "description": "Updated description"
}
```

Response ( OK):
```json
{
  "success": true,
  "data": {
    "id": "e-eb-d-a-",
    "name": "Conference  - Updated",
    "description": "Updated description",
    "updated_at": "--T::Z"
  }
}
```

---

 DELETE `/event-groups/:groupId`
Delete event group and cascade to events.

Permissions: Protected (group owner only)

URL Parameters:
- `groupId` (UUID) - Event group ID

Response ( No Content):

Note: Deleting a group removes all associated events and their check-ins.

---

 Event Endpoints

 GET `/event-groups/:groupId/events`
List all events within a group.

Permissions: Protected (group owner only)

URL Parameters:
- `groupId` (UUID) - Event group ID

Query Parameters:
| Parameter | Type | Options |
|-----------|------|---------|
| `page` | integer | Default:  |
| `limit` | integer | Default:  |
| `state` | string | OPEN, CLOSED |
| `sortBy` | string | name, startDate, createdAt |

Response ( OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "e-eb-d-a-",
      "name": "Keynote Session",
      "description": "Opening keynote address",
      "location": "Main Hall",
      "start_date": "--T::Z",
      "end_date": "--T::Z",
      "capacity": ,
      "state": "OPEN",
      "access_code": "ABC--XYZ",
      "attendee_count": ,
      "created_at": "--T::Z"
    }
  ],
  "pagination": {
    "page": ,
    "limit": ,
    "total": ,
    "totalPages": 
  }
}
```

---

 POST `/event-groups/:groupId/events`
Create a new event.

Permissions: Protected (group owner only)

URL Parameters:
- `groupId` (UUID) - Parent event group

Request Body:
```json
{
  "name": "Keynote Session",
  "description": "Opening keynote address",
  "location": "Main Hall",
  "start_date": "--T::Z",
  "end_date": "--T::Z",
  "capacity": ,
  "state": "OPEN"
}
```

Response ( Created):
```json
{
  "success": true,
  "data": {
    "id": "e-eb-d-a-",
    "group_id": "e-eb-d-a-",
    "name": "Keynote Session",
    "description": "Opening keynote address",
    "location": "Main Hall",
    "start_date": "--T::Z",
    "end_date": "--T::Z",
    "capacity": ,
    "state": "OPEN",
    "access_code": "ABC--XYZ",
    "qr_code_url": "https://api.qrserver.com/v/create-qr-code/?size=x&data=https://app.com/checkin?code=ABC--XYZ",
    "created_at": "--T::Z"
  }
}
```

Validation Rules:
- Name required (- characters)
- end_date must be >= start_date
- capacity must be positive integer
- state must be OPEN or CLOSED

---

 GET `/event-groups/:groupId/events/:eventId`
Retrieve specific event details.

Permissions: Protected (group owner only)

URL Parameters:
- `groupId` (UUID) - Event group ID
- `eventId` (UUID) - Event ID

Response ( OK):
```json
{
  "success": true,
  "data": {
    "id": "e-eb-d-a-",
    "name": "Keynote Session",
    "description": "Opening keynote address",
    "location": "Main Hall",
    "start_date": "--T::Z",
    "end_date": "--T::Z",
    "capacity": ,
    "state": "OPEN",
    "access_code": "ABC--XYZ",
    "qr_code_url": "https://api.qrserver.com/v/create-qr-code/?size=x&data=...",
    "attendee_count": ,
    "created_at": "--T::Z"
  }
}
```

---

 PUT `/event-groups/:groupId/events/:eventId`
Update event details.

Permissions: Protected (group owner only)

URL Parameters:
- `groupId` (UUID)
- `eventId` (UUID)

Request Body:
```json
{
  "name": "Keynote Session - Updated",
  "location": "Grand Hall",
  "state": "CLOSED"
}
```

Response ( OK):
```json
{
  "success": true,
  "data": {
    "id": "e-eb-d-a-",
    "name": "Keynote Session - Updated",
    "location": "Grand Hall",
    "state": "CLOSED",
    "updated_at": "--T::Z"
  }
}
```

---

 DELETE `/event-groups/:groupId/events/:eventId`
Delete event and associated check-ins.

Permissions: Protected (group owner only)

URL Parameters:
- `groupId` (UUID)
- `eventId` (UUID)

Response ( No Content):

---

 Check-In Endpoints

 POST `/events/:eventId/check-in/text`
Participant check-in via text access code.

Permissions: Public

URL Parameters:
- `eventId` (UUID) - Event ID

Request Body:
```json
{
  "access_code": "ABC--XYZ",
  "participant_email": "jane.participant@example.com",
  "participant_name": "Jane Participant"
}
```

Response ( Created):
```json
{
  "success": true,
  "data": {
    "id": "e-eb-d-a-",
    "event_id": "e-eb-d-a-",
    "participant_email": "jane.participant@example.com",
    "participant_name": "Jane Participant",
    "check_in_method": "TEXT",
    "checked_in_at": "--T::Z"
  },
  "meta": {
    "message": "Check-in successful!"
  }
}
```

Validation Rules:
- access_code required, must match event code
- participant_email required (valid email format)
- participant_name optional
- Event must be in OPEN state

Error Examples:
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

 POST `/events/:eventId/check-in/qr`
Participant check-in via QR code.

Permissions: Public

URL Parameters:
- `eventId` (UUID) - Event ID

Request Body:
```json
{
  "qr_payload": "https://app.com/checkin?code=ABC--XYZ",
  "participant_email": "jane.participant@example.com",
  "participant_name": "Jane Participant"
}
```

Response ( Created):
```json
{
  "success": true,
  "data": {
    "id": "e-eb-d-a-",
    "event_id": "e-eb-d-a-",
    "participant_email": "jane.participant@example.com",
    "check_in_method": "QR",
    "checked_in_at": "--T::Z"
  },
  "meta": {
    "message": "Check-in successful!"
  }
}
```

---

 GET `/events/:eventId/attendance`
List all check-ins for an event.

Permissions: Protected (event organizer only)

URL Parameters:
- `eventId` (UUID) - Event ID

Query Parameters:
| Parameter | Type | Options |
|-----------|------|---------|
| `page` | integer | Default:  |
| `limit` | integer | Default:  |
| `method` | string | TEXT, QR |
| `sortBy` | string | checked_in_at, participant_email |

Response ( OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "e-eb-d-a-",
      "participant_email": "jane.participant@example.com",
      "participant_name": "Jane Participant",
      "check_in_method": "TEXT",
      "checked_in_at": "--T::Z"
    },
    {
      "id": "e-eb-d-a-",
      "participant_email": "john.attendee@example.com",
      "participant_name": "John Attendee",
      "check_in_method": "QR",
      "checked_in_at": "--T::Z"
    }
  ],
  "pagination": {
    "page": ,
    "limit": ,
    "total": ,
    "totalPages": 
  }
}
```

---

 Export Endpoints

 GET `/events/:eventId/attendance/export/csv`
Export attendance records as CSV file.

Permissions: Protected (event organizer only)

URL Parameters:
- `eventId` (UUID) - Event ID

Query Parameters:
| Parameter | Type | Notes |
|-----------|------|-------|
| `format` | string | Optional, always CSV for this endpoint |

Response ( OK - File Download):
```
participant_email,participant_name,check_in_method,checked_in_at
jane.participant@example.com,Jane Participant,TEXT,--T::Z
john.attendee@example.com,John Attendee,QR,--T::Z
alice.smith@example.com,Alice Smith,TEXT,--T::Z
```

HTTP Headers:
```
Content-Type: text/csv
Content-Disposition: attachment; filename="event-EVENTID-attendance.csv"
```

---

 GET `/events/:eventId/attendance/export/xlsx`
Export attendance records as XLSX (Excel) file.

Permissions: Protected (event organizer only)

URL Parameters:
- `eventId` (UUID) - Event ID

Response ( OK - File Download):
- Excel workbook with formatted columns
- Headers: Participant Email, Name, Check-in Method, Timestamp

HTTP Headers:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="event-EVENTID-attendance.xlsx"
```

---

 Error Codes Reference

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` |  | Invalid request data |
| `UNAUTHORIZED` |  | Missing or invalid token |
| `FORBIDDEN` |  | Insufficient permissions |
| `NOT_FOUND` |  | Resource not found |
| `CONFLICT` |  | Resource already exists |
| `EVENT_CLOSED` |  | Event not accepting check-ins |
| `INVALID_CODE` |  | Access code invalid/expired |
| `INTERNAL_ERROR` |  | Server error |

---

 Pagination

List endpoints support pagination:

Default:
- Page: 
- Limit:  items per page
- Max limit: 

Example:
```bash
GET /api/events?page=&limit=
```

Response includes:
```json
{
  "pagination": {
    "page": ,
    "limit": ,
    "total": ,
    "totalPages": 
  }
}
```

---

 Rate Limiting (Phase )

Planned rate limits:
- Auth endpoints:  requests/minute per IP
- Check-in endpoints:  requests/minute per IP
- Other endpoints:  requests/minute per IP

---

 Postman Collection

Example API requests for testing:

```bash
 Register
POST http://localhost:/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password!",
  "name": "Test User"
}

---

 Login
POST http://localhost:/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password!"
}

---

 Create Event Group
POST http://localhost:/api/event-groups
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "name": "My Event Group",
  "description": "Test group"
}

---

 Create Event
POST http://localhost:/api/event-groups/{groupId}/events
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "name": "My Event",
  "location": "Main Hall",
  "start_date": "--T::Z",
  "end_date": "--T::Z",
  "state": "OPEN"
}

---

 Text Check-In
POST http://localhost:/api/events/{eventId}/check-in/text
Content-Type: application/json

{
  "access_code": "ABC--XYZ",
  "participant_email": "participant@example.com",
  "participant_name": "Test Participant"
}

---

 Export CSV
GET http://localhost:/api/events/{eventId}/attendance/export/csv
Authorization: Bearer {TOKEN}
```

---

 API Versioning (Phase )

Future versions will use path versioning:
```
/api/v/event-groups
/api/v/event-groups
```

Current version is always `/api/` (v).

---

For implementation details, see [ARCHITECTURE.md](./ARCHITECTURE.md)  
For database schema, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
