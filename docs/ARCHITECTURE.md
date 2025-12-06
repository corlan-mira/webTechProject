# System Architecture & Design

## Overview

The Event Attendance Monitoring System is built on a **three-tier web application architecture**:

1. **Frontend Layer** (React SPA)
2. **API Layer** (Node.js/Express REST API)
3. **Data Layer** (PostgreSQL/MySQL with Sequelize ORM)

This document describes the architectural principles, design patterns, and component interactions.

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     Client Browser                            │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         React Single Page Application (SPA)            │  │
│  │                                                         │  │
│  │  • Event Organizer Dashboard                           │  │
│  │  • Participant Check-In Portal                         │  │
│  │  • Real-time UI Updates                                │  │
│  └────────────────┬─────────────────────────────────────┘  │
└───────────────────┼──────────────────────────────────────────┘
                    │ HTTP/REST
                    │ (JSON payloads)
┌───────────────────▼──────────────────────────────────────────┐
│              Backend Server (Node.js/Express)                 │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            REST API Endpoints                          │  │
│  │ • /api/auth, /api/event-groups, /api/events, etc.    │  │
│  └────────────────────────────────────────────────────────┘  │
│                         │                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Middleware & Request Processing               │  │
│  │ • Authentication (JWT), Validation, Error Handling    │  │
│  └────────────────────────────────────────────────────────┘  │
│                         │                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Business Logic Layer (Controllers/Services)   │  │
│  │ • Event management, Check-in logic, Data export       │  │
│  └────────────────────────────────────────────────────────┘  │
│                         │                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            External Services                          │  │
│  │ • QRServer API (QR code generation)                   │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────┬──────────────────────────────────────────┘
                    │ SQL Queries
                    │ (via Sequelize ORM)
┌───────────────────▼──────────────────────────────────────────┐
│           Database Server (PostgreSQL / MySQL)                │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Tables:                                               │  │
│  │  • users, event_groups, events, check_ins             │  │
│  │  • Indices on foreign keys and access codes           │  │
│  │  • Constraints for data integrity                     │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Design Principles

### 1. **Separation of Concerns**
- **Controllers:** Handle HTTP requests/responses
- **Services:** Contain business logic
- **Models:** Define data structures
- **Middleware:** Cross-cutting concerns (auth, validation)

### 2. **REST API Design**
- **Resource-Oriented:** URLs represent resources (not actions)
- **Standard HTTP Methods:** GET (read), POST (create), PUT (update), DELETE (remove)
- **Consistent Response Format:** All endpoints return structured JSON

### 3. **Security First**
- **Authentication:** JWT tokens for EO endpoints
- **Authorization:** Role-based access control (EO vs. Participant)
- **Input Validation:** All user input validated at boundaries
- **Password Security:** Bcrypt hashing with salt

### 4. **Scalability & Performance**
- **Stateless API:** No server-side session storage
- **Database Optimization:** Proper indexing on frequently queried fields
- **Error Handling:** Graceful degradation with meaningful error messages

---

## Data Flow Diagrams

### Flow 1: Event Organizer - Create Event

```
┌─────────────┐
│   EO Login  │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ POST /api/auth/login │
│ (email, password)    │
└──────────┬───────────┘
           │
           ▼
    ┌─────────────┐
    │ Validate    │
    │ Credentials │
    └──────┬──────┘
           │
           ▼
┌──────────────────────┐
│ Return JWT Token     │
│ (stored in localStorage)
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ POST /api/event-groups/:groupId/     │
│       events                         │
│ (name, location, start_date, etc.)   │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────┐
│ Validate JWT Token   │
│ (authMiddleware)     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│ Validate Request Data        │
│ (joi schema validation)      │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Business Logic:              │
│ 1. Generate access code      │
│ 2. Create event record       │
│ 3. Store in database         │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Return event with:           │
│ - Event ID, code, dates      │
│ - QR code URL                │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Frontend displays event       │
│ with generated QR code       │
└──────────────────────────────┘
```

### Flow 2: Participant - Text Check-In

```
┌──────────────────────┐
│ Participant navigates│
│ to check-in portal   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Select/view event    │
│ Enter access code    │
│ Enter email/name     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│ POST /api/events/:eventId/   │
│       check-in/text          │
│ (code, email, name)          │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Validate Request Data        │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Business Logic:              │
│ 1. Fetch event               │
│ 2. Verify state = OPEN       │
│ 3. Validate access code      │
│ 4. Check for duplicates      │
│ 5. Record check-in           │
│ 6. Return timestamp          │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Response (201):              │
│ - Confirmation message       │
│ - Timestamp                  │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Show success to participant  │
└──────────────────────────────┘
```

### Flow 3: Event Organizer - Export Attendance

```
┌──────────────────────┐
│ EO navigates to      │
│ event attendance     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│ Click "Export as CSV"        │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ GET /api/events/:eventId/        │
│     attendance/export/csv        │
│ (Authorization: JWT token)       │
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Verify JWT & authorization  │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Business Logic:              │
│ 1. Fetch check-in records    │
│ 2. Format data               │
│ 3. Generate CSV file         │
│ 4. Return as download        │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ HTTP Response:               │
│ - Content-Type: text/csv     │
│ - CSV file content           │
│ - Attachment header          │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Browser downloads CSV file   │
│ (attendance.csv)             │
└──────────────────────────────┘
```

---

## Component Architecture

### Backend Structure

#### Controllers
Handle HTTP request/response cycles.

**Example: EventController.js**
```
EventController
├── createEvent(req, res)
├── getEvent(req, res)
├── updateEvent(req, res)
├── deleteEvent(req, res)
└── listEvents(req, res)
```

#### Services
Encapsulate business logic.

**Example: EventService.js**
```
EventService
├── createEvent(groupId, eventData)
├── getEventById(eventId)
├── updateEvent(eventId, updates)
├── deleteEvent(eventId)
├── generateAccessCode()
└── toggleEventState(eventId, newState)
```

#### Models (Sequelize)
Define data structures and relationships.

**Example: Event.js**
```
Event
├── id (UUID)
├── group_id (FK)
├── name
├── access_code
├── state (ENUM)
├── created_at
└── Associations
    └── belongsTo(EventGroup)
    └── hasMany(CheckIn)
```

#### Middleware
Cross-cutting concerns.

**Example: authMiddleware.js**
- Verify JWT token
- Attach user to request
- Return 401 if invalid

**Example: validation.js**
- Validate request schema
- Return 400 if invalid

#### Routes
Map HTTP methods to controllers.

**Example: eventRoutes.js**
```
POST   /api/event-groups/:groupId/events     → createEvent
GET    /api/event-groups/:groupId/events     → listEvents
GET    /api/event-groups/:groupId/events/:id → getEvent
PUT    /api/event-groups/:groupId/events/:id → updateEvent
DELETE /api/event-groups/:groupId/events/:id → deleteEvent
```

### Frontend Structure

#### Pages
Top-level route components.

**Example: EventDetailsPage.jsx**
- Renders event details
- Displays attendance list
- Handles export actions

#### Components
Reusable UI components.

**Example: TextCheckInForm.jsx**
- Form for entering access code
- Input validation
- Submit handler

**Example: EventForm.jsx**
- Reusable form for create/edit
- Field validation
- Submission logic

#### Services (API Client)
Communicate with backend.

**Example: eventService.js**
```javascript
const eventService = {
  createEvent(groupId, data) { /* POST request */ },
  getEvent(eventId) { /* GET request */ },
  updateEvent(eventId, data) { /* PUT request */ },
  deleteEvent(eventId) { /* DELETE request */ },
  exportAttendance(eventId, format) { /* GET request */ }
};
```

#### Custom Hooks
Reusable stateful logic.

**Example: useFetchEvents.js**
- Fetch events from API
- Handle loading/error states
- Memoize results

**Example: useAuth.js**
- Manage authentication state
- Provide login/logout/register
- Store JWT token

#### Context
Global state management.

**Example: AuthContext.js**
- Provide auth state to app
- User, token, isAuthenticated

---

## Database Design

### Tables Overview

```
┌─────────────────────────────────────────────────────────────┐
│ USERS                                                       │
├─────────────────────────────────────────────────────────────┤
│ id (PK)           │ UUID/INT                                │
│ email (UNIQUE)    │ VARCHAR(255)                            │
│ password_hash     │ VARCHAR(255)                            │
│ name              │ VARCHAR(255)                            │
│ created_at        │ TIMESTAMP                               │
└─────────────────────────────────────────────────────────────┘
            │
            │ 1:N
            ▼
┌─────────────────────────────────────────────────────────────┐
│ EVENT_GROUPS                                                │
├─────────────────────────────────────────────────────────────┤
│ id (PK)           │ UUID/INT                                │
│ user_id (FK)      │ References USERS.id (CASCADE DELETE)    │
│ name              │ VARCHAR(255)                            │
│ description       │ TEXT                                    │
│ created_at        │ TIMESTAMP                               │
└─────────────────────────────────────────────────────────────┘
            │
            │ 1:N
            ▼
┌─────────────────────────────────────────────────────────────┐
│ EVENTS                                                      │
├─────────────────────────────────────────────────────────────┤
│ id (PK)           │ UUID/INT                                │
│ group_id (FK)     │ References EVENT_GROUPS.id              │
│ name              │ VARCHAR(255)                            │
│ location          │ VARCHAR(255)                            │
│ start_date        │ TIMESTAMP                               │
│ end_date          │ TIMESTAMP                               │
│ capacity          │ INT                                     │
│ state             │ ENUM ('OPEN', 'CLOSED')                │
│ access_code       │ VARCHAR(20) UNIQUE                      │
│ created_at        │ TIMESTAMP                               │
└─────────────────────────────────────────────────────────────┘
            │
            │ 1:N
            ▼
┌─────────────────────────────────────────────────────────────┐
│ CHECK_INS                                                   │
├─────────────────────────────────────────────────────────────┤
│ id (PK)           │ UUID/INT                                │
│ event_id (FK)     │ References EVENTS.id (CASCADE DELETE)   │
│ participant_email │ VARCHAR(255)                            │
│ participant_name  │ VARCHAR(255)                            │
│ check_in_method   │ ENUM ('TEXT', 'QR')                    │
│ checked_in_at     │ TIMESTAMP (DEFAULT NOW())               │
│ created_at        │ TIMESTAMP                               │
└─────────────────────────────────────────────────────────────┘
```

### Indices
For optimal query performance:

```sql
-- users
CREATE INDEX idx_users_email ON users(email);

-- event_groups
CREATE INDEX idx_event_groups_user_id ON event_groups(user_id);

-- events
CREATE INDEX idx_events_group_id ON events(group_id);
CREATE INDEX idx_events_access_code ON events(access_code);
CREATE INDEX idx_events_state ON events(state);

-- check_ins
CREATE INDEX idx_check_ins_event_id ON check_ins(event_id);
CREATE INDEX idx_check_ins_participant_email ON check_ins(participant_email);
CREATE INDEX idx_check_ins_checked_in_at ON check_ins(checked_in_at);
```

---

## API Design Patterns

### Request/Response Format

**All requests:**
```json
{
  "data": { /* Request body */ }
}
```

**All successful responses:**
```json
{
  "success": true,
  "data": { /* Response data */ },
  "meta": {
    "timestamp": "2025-11-16T10:00:00Z"
  }
}
```

**Error responses:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error",
    "details": { /* Additional context */ }
  }
}
```

### Pagination

For list endpoints:

**Request:**
```
GET /api/endpoint?page=1&limit=10
```

**Response:**
```json
{
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

## Security Architecture

### Authentication Flow

```
┌──────────────┐
│ EO submits   │
│ credentials  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ Hash password (bcrypt)   │
│ Compare with stored hash │
└──────┬───────────────────┘
       │
       ├─ Invalid → 401 Unauthorized
       │
       └─ Valid → Generate JWT
                  ├─ Payload: { userId, email }
                  ├─ Sign with JWT_SECRET
                  ├─ Set expiry (24h)
                  └─ Return token to client
```

### Authorization Flow

```
┌──────────────────────────┐
│ Request with JWT token   │
│ (in Authorization header)│
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ authMiddleware:          │
│ 1. Extract token         │
│ 2. Verify signature      │
│ 3. Check expiry          │
└──────┬───────────────────┘
       │
       ├─ Invalid/Expired → 401 Unauthorized
       │
       └─ Valid → Attach user to req
                  Continue to handler
```

### Input Validation

All user input is validated:

```javascript
// Validation at API boundary
POST /api/event-groups/:groupId/events
1. Validate URL params (groupId is valid UUID)
2. Validate request body (name, dates, etc.)
3. Validate JWT token (authMiddleware)
4. Sanitize inputs (prevent injection)
5. Pass to business logic
```

---

## Deployment Architecture

### Development Environment
```
Developer Machine
├── Frontend (React dev server on port 3000)
├── Backend (Node.js dev server on port 5000)
└── Database (PostgreSQL local instance)
```

### Production Environment (Phase 2)
```
Cloud Platform (AWS/Heroku)
├── Frontend (React SPA on CDN)
├── Backend (Node.js on serverless/container)
├── Database (Managed PostgreSQL)
└── External Services (QRServer API)
```

---

## Conclusion

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Scalability through stateless API
- ✅ Security through JWT & input validation
- ✅ Maintainability through design patterns
- ✅ Performance through proper indexing

For detailed API endpoints, see [API.md](./API.md)  
For database schema details, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
