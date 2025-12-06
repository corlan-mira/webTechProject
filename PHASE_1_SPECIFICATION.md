# Event Attendance Monitoring System
## Phase 1 Technical Specification

**Document Version:** 1.0  
**Last Updated:** December 6, 2025  
**Status:** Phase 1 Specification

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Objectives](#objectives)
3. [System Architecture](#system-architecture)
4. [Functional Requirements](#functional-requirements)
5. [User Roles and Workflows](#user-roles-and-workflows)
6. [Entity-Relationship Diagram](#entity-relationship-diagram)
7. [API Specification](#api-specification)
8. [External Service Integration](#external-service-integration)
9. [Technology Stack](#technology-stack)
10. [Project Plan & Milestones](#project-plan--milestones)
11. [Development Constraints](#development-constraints)
12. [Repository Structure](#repository-structure)
13. [Git Commit Strategy](#git-commit-strategy)

---

## Project Overview

The **Event Attendance Monitoring System** is a web-based application designed to streamline attendance tracking for organized events. The system enables Event Organizers (EOs) to create and manage event groups and individual events, and allows participants to check in via two methods: text-based access codes or QR code scanning.

### Key Features
- Event group and event management
- Dual check-in mechanisms (text codes and QR codes)
- Real-time attendance tracking
- Data export capabilities (CSV/XLSX)
- Role-based access control

---

## Objectives

### Primary Objectives
1. **Simplify Event Management:** Enable EOs to create, configure, and manage events with minimal overhead.
2. **Flexible Check-In:** Provide participants with multiple secure check-in methods to accommodate various event environments.
3. **Data Accessibility:** Generate exportable attendance reports in multiple formats for analysis and record-keeping.
4. **Scalability:** Design a system capable of handling multiple concurrent events and participants.

### Secondary Objectives
1. Ensure data integrity and consistency through relational database design.
2. Provide an intuitive, responsive user interface for both EOs and participants.
3. Facilitate API-first architecture for potential mobile or third-party integrations.

---

## System Architecture

### High-Level Architecture Overview

The system follows a **three-tier architecture** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React SPA)                │
│                                                               │
│  • Event Organizer Dashboard                                 │
│  • Participant Check-In Portal                               │
│  • Real-time Updates via WebSocket (optional Phase 2)        │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP/REST
┌─────────────────────────────▼───────────────────────────────┐
│                  API Layer (Node.js/Express)                 │
│                                                               │
│  • REST Endpoints                                            │
│  • Authentication & Authorization                            │
│  • Business Logic                                            │
│  • Request Validation                                        │
└─────────────────────────────┬───────────────────────────────┘
                              │ SQL Query
┌─────────────────────────────▼───────────────────────────────┐
│              Data Layer (PostgreSQL/MySQL)                   │
│                                                               │
│  • Relational Database                                       │
│  • Sequelize ORM                                             │
│  • Data Persistence                                          │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18+ | Single Page Application |
| **State Management** | Context API or Redux | Application state |
| **HTTP Client** | Axios | API requests |
| **UI Framework** | React Bootstrap / Material-UI | Component library |
| **Backend** | Node.js + Express | REST API server |
| **Database** | PostgreSQL or MySQL | Data persistence |
| **ORM** | Sequelize | Database abstraction |
| **Authentication** | JWT | Session management |
| **QR Code API** | QRServer (qr-server.com) | QR code generation |
| **Environment Config** | dotenv | Configuration management |

---

## Functional Requirements

### Phase 1 Minimum Requirements

#### 1. Event Group Management
- **Create Event Group:** EOs can create named groups to organize related events.
- **List Event Groups:** Display all event groups belonging to the logged-in EO.
- **Edit Event Group:** Update group metadata (name, description).
- **Delete Event Group:** Remove event groups (with cascade to associated events).

#### 2. Event Management
- **Create Event:** EOs create events within a group, specifying:
  - Event name and description
  - Start and end dates/times
  - Location
  - Capacity (optional)
  - Initial state (OPEN or CLOSED)
- **List Events:** Display events within a group with filtering and pagination.
- **Edit Event:** Modify event details (except immutable fields like creation date).
- **Delete Event:** Remove events and associated check-in records.
- **Event State Transitions:**
  - **OPEN:** Participants can check in
  - **CLOSED:** No new check-ins allowed
  - Manual toggle by EO

#### 3. Access Code Management
- **Auto-Generate Access Code:** Generate unique, human-readable alphanumeric codes (e.g., "ABC-123-XYZ").
- **Code Storage:** Securely store codes with event association.
- **Code Validation:** Verify code existence and association during participant check-in.
- **Code Uniqueness:** Ensure no duplicate codes per event.

#### 4. QR Code Generation
- **Generate QR Code:** Create QR codes linking to check-in endpoints (e.g., `https://app.com/checkin?code=ACCESS_CODE`).
- **External API Integration:** Use QR code generation service (QRServer or similar).
- **QR Code Display:** Render codes in event details and downloadable materials.

#### 5. Participant Check-In
- **Text-Based Check-In:** Accept participant input of access code, validate, and record attendance.
- **QR Code Check-In:** Scan QR codes using device camera (via web scanner library).
- **Check-In Validation:**
  - Event must be in OPEN state
  - Access code must be valid
  - Participant email/identifier required (for CSV export context)
  - Prevent duplicate check-ins per event per participant (per Phase 1 scope)
- **Check-In Recording:**
  - Timestamp check-in
  - Associate with event and participant identifier
  - Store in database

#### 6. Attendance Listing & Export
- **Attendance List View:** EOs can view attendees for each event with:
  - Participant identifier/email
  - Check-in timestamp
  - Check-in method (text code vs. QR)
- **Export to CSV:** Generate CSV file containing attendance records.
- **Export to XLSX:** Generate Excel file with formatted attendance data.
- **Filter & Search:** Filter attendees by date range, name, or check-in method.

---

## User Roles and Workflows

### Role Definitions

#### Event Organizer (EO)
- **Permissions:**
  - Create, read, update, delete event groups
  - Create, read, update, delete events within owned groups
  - Generate access codes and QR codes
  - View attendance lists
  - Export attendance data
  - Manage access codes (view, regenerate)
- **Authentication:** Email + password
- **Session Management:** JWT tokens with expiration

#### Participant
- **Permissions:**
  - Check in using text access code
  - Check in using QR code scan
  - View personal check-in confirmation (optional Phase 2)
- **Authentication:** No authentication required (anonymous check-in)
- **Session Management:** Not applicable

### User Workflows

#### Workflow 1: Event Organizer - Setup & Management
```
1. EO logs in with email/password
2. EO creates or selects an event group
3. EO creates an event with details and sets state to OPEN
4. System auto-generates access code (e.g., ABC-123)
5. System generates QR code linked to check-in endpoint
6. EO displays code/QR in event materials or at venue
7. EO monitors check-ins in real-time on dashboard
8. After event concludes, EO changes state to CLOSED
9. EO exports attendance list to CSV/XLSX
```

#### Workflow 2: Participant - Text-Based Check-In
```
1. Participant navigates to check-in portal
2. Selects event from dropdown or scans event QR code
3. Enters access code (text input)
4. Provides identifier (email, name, or ID)
5. System validates code and event state
6. System records check-in with timestamp
7. Confirmation message displayed
```

#### Workflow 3: Participant - QR Code Check-In
```
1. Participant opens check-in portal on mobile device
2. Clicks "Scan QR Code" button
3. Device camera activates
4. Participant scans event QR code
5. System extracts access code from QR data
6. Redirects to check-in form pre-populated with code
7. Participant provides identifier
8. System records check-in
9. Confirmation message displayed
```

---

## Entity-Relationship Diagram

### Database Tables & Relationships

#### Table 1: `users`
Stores Event Organizer accounts.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| `id` | UUID/INT | PRIMARY KEY | Auto-increment or UUID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login identifier |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed |
| `name` | VARCHAR(255) | NOT NULL | Full name |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification |

#### Table 2: `event_groups`
Groups of related events managed by EOs.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| `id` | UUID/INT | PRIMARY KEY | |
| `user_id` | UUID/INT | FOREIGN KEY (users.id) | Event owner |
| `name` | VARCHAR(255) | NOT NULL | Group name |
| `description` | TEXT | NULL | Optional description |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

#### Table 3: `events`
Individual events within groups.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| `id` | UUID/INT | PRIMARY KEY | |
| `group_id` | UUID/INT | FOREIGN KEY (event_groups.id) | Parent group |
| `name` | VARCHAR(255) | NOT NULL | Event name |
| `description` | TEXT | NULL | Event details |
| `location` | VARCHAR(255) | NULL | Event location |
| `start_date` | TIMESTAMP | NOT NULL | Event start |
| `end_date` | TIMESTAMP | NOT NULL | Event end |
| `capacity` | INT | NULL | Max participants |
| `state` | ENUM('OPEN', 'CLOSED') | NOT NULL, DEFAULT 'OPEN' | Check-in availability |
| `access_code` | VARCHAR(20) | UNIQUE, NOT NULL | Access code for check-in |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

#### Table 4: `check_ins`
Records of participant check-ins.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| `id` | UUID/INT | PRIMARY KEY | |
| `event_id` | UUID/INT | FOREIGN KEY (events.id) | Event checked into |
| `participant_email` | VARCHAR(255) | NOT NULL | Participant identifier |
| `participant_name` | VARCHAR(255) | NULL | Optional participant name |
| `check_in_method` | ENUM('TEXT', 'QR') | NOT NULL | How participant checked in |
| `checked_in_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Check-in timestamp |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation |

### Entity Relationships

```
users (1) ──→ (*) event_groups
              │
              └──→ (*) events
                   │
                   └──→ (*) check_ins
```

#### Relationship Details

| Relationship | Cardinality | Cascade | Notes |
|-------------|-----------|---------|-------|
| users → event_groups | 1:N | DELETE CASCADE | EO owns multiple groups |
| event_groups → events | 1:N | DELETE CASCADE | Groups contain multiple events |
| events → check_ins | 1:N | DELETE CASCADE | Events have multiple check-ins |

---

## API Specification

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new Event Organizer account.

**Request Body:**
```json
{
  "email": "eo@example.com",
  "password": "secure_password",
  "name": "John Organizer"
}
```

**Response (201):**
```json
{
  "id": "uuid-or-id",
  "email": "eo@example.com",
  "name": "John Organizer",
  "token": "jwt-token"
}
```

#### POST `/api/auth/login`
Authenticate and retrieve JWT token.

**Request Body:**
```json
{
  "email": "eo@example.com",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "id": "uuid-or-id",
  "email": "eo@example.com",
  "token": "jwt-token",
  "expiresIn": 86400
}
```

#### POST `/api/auth/logout`
Invalidate current session (optional for Phase 1).

---

### Event Group Endpoints

#### GET `/api/event-groups`
List all event groups for logged-in EO.

**Response (200):**
```json
{
  "data": [
    {
      "id": "group-1",
      "name": "Conference 2025",
      "description": "Annual tech conference",
      "created_at": "2025-11-16T10:00:00Z",
      "updated_at": "2025-11-16T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### POST `/api/event-groups`
Create a new event group.

**Request Body:**
```json
{
  "name": "Conference 2025",
  "description": "Annual tech conference"
}
```

**Response (201):**
```json
{
  "id": "group-1",
  "name": "Conference 2025",
  "description": "Annual tech conference",
  "created_at": "2025-11-16T10:00:00Z"
}
```

#### GET `/api/event-groups/:groupId`
Retrieve specific event group.

**Response (200):**
```json
{
  "id": "group-1",
  "name": "Conference 2025",
  "description": "Annual tech conference",
  "created_at": "2025-11-16T10:00:00Z",
  "updated_at": "2025-11-16T10:00:00Z"
}
```

#### PUT `/api/event-groups/:groupId`
Update event group.

**Request Body:**
```json
{
  "name": "Conference 2025",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "id": "group-1",
  "name": "Conference 2025",
  "description": "Updated description",
  "updated_at": "2025-11-16T11:00:00Z"
}
```

#### DELETE `/api/event-groups/:groupId`
Delete event group and cascade to events.

**Response (204):** No content

---

### Event Endpoints

#### GET `/api/event-groups/:groupId/events`
List all events within a group.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `state` (optional): Filter by state ('OPEN', 'CLOSED')

**Response (200):**
```json
{
  "data": [
    {
      "id": "event-1",
      "group_id": "group-1",
      "name": "Keynote Session",
      "description": "Opening keynote",
      "location": "Main Hall",
      "start_date": "2025-11-16T09:00:00Z",
      "end_date": "2025-11-16T10:30:00Z",
      "capacity": 500,
      "state": "OPEN",
      "access_code": "ABC-123-XYZ",
      "created_at": "2025-11-16T08:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### POST `/api/event-groups/:groupId/events`
Create a new event.

**Request Body:**
```json
{
  "name": "Keynote Session",
  "description": "Opening keynote",
  "location": "Main Hall",
  "start_date": "2025-11-16T09:00:00Z",
  "end_date": "2025-11-16T10:30:00Z",
  "capacity": 500,
  "state": "OPEN"
}
```

**Response (201):**
```json
{
  "id": "event-1",
  "group_id": "group-1",
  "name": "Keynote Session",
  "description": "Opening keynote",
  "location": "Main Hall",
  "start_date": "2025-11-16T09:00:00Z",
  "end_date": "2025-11-16T10:30:00Z",
  "capacity": 500,
  "state": "OPEN",
  "access_code": "ABC-123-XYZ",
  "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://app.com/checkin?code=ABC-123-XYZ",
  "created_at": "2025-11-16T08:00:00Z"
}
```

#### GET `/api/event-groups/:groupId/events/:eventId`
Retrieve specific event details.

**Response (200):**
```json
{
  "id": "event-1",
  "group_id": "group-1",
  "name": "Keynote Session",
  "description": "Opening keynote",
  "location": "Main Hall",
  "start_date": "2025-11-16T09:00:00Z",
  "end_date": "2025-11-16T10:30:00Z",
  "capacity": 500,
  "state": "OPEN",
  "access_code": "ABC-123-XYZ",
  "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...",
  "attendee_count": 42
}
```

#### PUT `/api/event-groups/:groupId/events/:eventId`
Update event details.

**Request Body:**
```json
{
  "name": "Keynote Session",
  "state": "CLOSED"
}
```

**Response (200):**
```json
{
  "id": "event-1",
  "name": "Keynote Session",
  "state": "CLOSED",
  "updated_at": "2025-11-16T10:35:00Z"
}
```

#### DELETE `/api/event-groups/:groupId/events/:eventId`
Delete event and associated check-ins.

**Response (204):** No content

---

### Check-In Endpoints

#### POST `/api/events/:eventId/check-in/text`
Participant check-in via text access code.

**Request Body:**
```json
{
  "access_code": "ABC-123-XYZ",
  "participant_email": "participant@example.com",
  "participant_name": "Jane Participant"
}
```

**Response (201):**
```json
{
  "id": "checkin-1",
  "event_id": "event-1",
  "participant_email": "participant@example.com",
  "participant_name": "Jane Participant",
  "check_in_method": "TEXT",
  "checked_in_at": "2025-11-16T09:15:00Z",
  "message": "Check-in successful!"
}
```

#### POST `/api/events/:eventId/check-in/qr`
Participant check-in via QR code (extracts code from QR payload).

**Request Body:**
```json
{
  "qr_payload": "https://app.com/checkin?code=ABC-123-XYZ",
  "participant_email": "participant@example.com",
  "participant_name": "Jane Participant"
}
```

**Response (201):**
```json
{
  "id": "checkin-1",
  "event_id": "event-1",
  "participant_email": "participant@example.com",
  "participant_name": "Jane Participant",
  "check_in_method": "QR",
  "checked_in_at": "2025-11-16T09:15:00Z",
  "message": "Check-in successful!"
}
```

#### GET `/api/events/:eventId/attendance`
List all check-ins for an event (EO only).

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Results per page
- `method` (optional): Filter by method ('TEXT', 'QR')

**Response (200):**
```json
{
  "data": [
    {
      "id": "checkin-1",
      "participant_email": "participant@example.com",
      "participant_name": "Jane Participant",
      "check_in_method": "TEXT",
      "checked_in_at": "2025-11-16T09:15:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

---

### Export Endpoints

#### GET `/api/events/:eventId/attendance/export/csv`
Export attendance as CSV file.

**Response (200):** CSV file download
```
participant_email,participant_name,check_in_method,checked_in_at
participant@example.com,Jane Participant,TEXT,2025-11-16T09:15:00Z
```

#### GET `/api/events/:eventId/attendance/export/xlsx`
Export attendance as XLSX file.

**Response (200):** XLSX file download

---

### Error Responses

All endpoints return consistent error format on failure:

**Response (4xx/5xx):**
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Detailed error message",
    "details": {}
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Duplicate or invalid state
- `VALIDATION_ERROR` (400): Invalid request data
- `INTERNAL_ERROR` (500): Server error

---

## External Service Integration

### QR Code Generation Service

#### Service: QRServer API
- **Provider:** QRServer (https://qr-server.com/)
- **Endpoint:** `GET https://api.qrserver.com/v1/create-qr-code/`
- **Parameters:**
  - `size`: Image dimensions (e.g., "300x300")
  - `data`: URL-encoded data to encode (check-in link)
  - `format`: Image format ("png", "svg", "gif")

#### Integration Details

**QR Code URL Construction:**
```
https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=https://app.com/checkin?code=ABC-123-XYZ
```

**Backend Implementation:**
1. Upon event creation, generate unique access code.
2. Construct check-in link with access code.
3. Request QR code from QRServer API.
4. Store QR code URL in database (or generate on-the-fly).
5. Return URL to frontend for display/download.

**Fallback Strategy:**
- Cache QR codes to reduce API calls.
- Implement rate limiting awareness.
- Handle timeouts gracefully with retry logic.

---

## Technology Stack

### Frontend
- **Framework:** React 18+
- **State Management:** Context API or Redux Toolkit
- **HTTP Client:** Axios
- **QR Scanner:** `react-qr-code` (display) + `html5-qrcode` or `jsqr` (scanning)
- **UI Components:** React Bootstrap or Material-UI
- **Routing:** React Router v6
- **Form Handling:** React Hook Form
- **Validation:** Yup or Zod
- **Date Handling:** date-fns or Day.js
- **Build Tool:** Vite or Create React App
- **Package Manager:** npm or yarn

### Backend
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js
- **ORM:** Sequelize
- **Authentication:** jsonwebtoken (JWT), bcryptjs
- **Database Drivers:** pg (PostgreSQL) or mysql2 (MySQL)
- **Validation:** joi or express-validator
- **CORS:** cors middleware
- **Environment Config:** dotenv
- **Logging:** winston or pino
- **Error Handling:** Custom middleware
- **File Export:** `csv-stringify` (CSV), `xlsx` (Excel)
- **HTTP Client:** axios (for QR API calls)

### Database
- **Primary:** PostgreSQL 12+
- **Alternative:** MySQL 8+
- **Client:** psql or mysql CLI tools
- **ORM:** Sequelize 6+

### Development Tools
- **Version Control:** Git
- **Package Manager:** npm or yarn
- **Linting:** ESLint
- **Code Formatting:** Prettier
- **Testing Framework:** Jest (optional for Phase 1)
- **API Testing:** Postman or Insomnia
- **IDE:** Visual Studio Code

### Deployment (Optional for Phase 1)
- **Hosting:** Heroku, Vercel, AWS, or similar
- **Environment:** Docker (optional)
- **CI/CD:** GitHub Actions (optional)

---

## Project Plan & Milestones

### Phase 1: Foundation & Core Features
**Deadline:** November 16, 2025 (COMPLETED)

#### Completed Deliverables
- [x] Project specification and architecture design
- [x] Database schema design with ERD
- [x] API endpoint specifications
- [x] Repository setup with initial structure
- [x] Development environment configuration

#### Phase 1 Scope
**Duration:** November 2–16, 2025 (2 weeks)

| Milestone | Task | Duration | Assignee | Status |
|-----------|------|----------|----------|--------|
| **M1.1: Setup** | Project initialization, repo setup | 1 day | Dev Team | Completed |
| **M1.2: Backend** | Database models, API endpoints (auth, events, check-in) | 5 days | Backend Dev | Completed |
| **M1.3: Frontend** | EO dashboard, event management UI | 4 days | Frontend Dev | Completed |
| **M1.4: Integration** | Backend-frontend integration, testing | 2 days | Full Team | Completed |
| **M1.5: Documentation** | Code documentation, README | 1 day | Dev Team | Completed |
| **M1.6: Review & QA** | Code review, bug fixes | 2 days | QA + Leads | Completed |

**Deliverables:**
- Functional backend API (Node.js/Express)
- Basic React frontend with EO dashboard
- Event and group management functionality
- Text-based check-in with validation
- CSV export functionality
- Project documentation and setup guide

---

### Phase 2: Advanced Features & Polish
**Deadline:** December 6, 2025 (IN PROGRESS)

#### Phase 2 Scope
**Duration:** November 17 – December 6, 2025 (3 weeks)

| Milestone | Task | Duration | Assignee | Status |
|-----------|------|----------|----------|--------|
| **M2.1: QR Integration** | QR code generation and scanning | 3 days | Backend + Frontend | In Progress |
| **M2.2: Export Enhancement** | XLSX export, filtering, advanced analytics | 2 days | Backend + Frontend | In Progress |
| **M2.3: UI/UX Refinement** | Responsive design, accessibility, error handling | 3 days | Frontend Dev | Not Started |
| **M2.4: Testing & Optimization** | Unit tests, integration tests, performance | 4 days | QA + Dev | Not Started |
| **M2.5: Deployment Prep** | Environment config, CI/CD setup, documentation | 3 days | DevOps + Dev | Not Started |
| **M2.6: Final QA & Release** | End-to-end testing, bug fixes, release | 2 days | QA + Leads | Not Started |

**Deliverables:**
- Complete QR code functionality
- Advanced attendance analytics and filtering
- Polished, responsive UI
- Comprehensive test suite
- Deployment-ready application
- Final technical documentation

---

### Final Demo
**Scheduled:** Last Tutorial Session (Date TBD)

**Demo Scope:**
- Live walkthrough of all Phase 1 & 2 features
- Event creation and management
- Dual check-in methods (text + QR)
- Attendance data export
- Code quality and architecture review
- Deployment and hosting overview

**Demo Deliverables:**
- Working application (live or staged)
- Feature demonstration script
- Code repository with complete history
- Architecture documentation
- Post-demo reflection and lessons learned

---

## Development Constraints

### Naming Conventions

#### Files & Directories
- **Backend:**
  - Routes: `routes/eventRoutes.js`, `routes/authRoutes.js`
  - Controllers: `controllers/EventController.js`
  - Models: `models/Event.js`, `models/User.js` (Sequelize models)
  - Middleware: `middleware/authMiddleware.js`
  - Utilities: `utils/generateAccessCode.js`, `utils/qrCodeGenerator.js`
  - Configuration: `config/database.js`, `config/env.js`

- **Frontend:**
  - Components: `components/EventForm.jsx`, `components/CheckInModal.jsx`
  - Pages: `pages/Dashboard.jsx`, `pages/CheckInPage.jsx`
  - Hooks: `hooks/useAuth.js`, `hooks/useFetchEvents.js`
  - Services: `services/apiClient.js`, `services/eventService.js`
  - Styles: `styles/EventForm.css` or `EventForm.module.css`
  - Utilities: `utils/validators.js`, `utils/formatters.js`

#### Variables & Functions
- **Camel Case:** `getUserById()`, `eventName`, `isEventOpen`
- **Constants:** `UPPERCASE_WITH_UNDERSCORES`: `API_BASE_URL`, `JWT_EXPIRY_TIME`
- **Boolean Variables:** Prefix with `is` or `has`: `isLoading`, `hasError`
- **Event Handlers:** Prefix with `handle`: `handleSubmit()`, `handleDelete()`
- **Async Functions:** Use async/await, name explicitly: `fetchEventData()`, `submitCheckIn()`

#### API Naming
- **Endpoints:** Lowercase, hyphen-separated: `/api/event-groups`, `/api/check-in/text`
- **Parameters:** camelCase: `?sortBy=createdAt`, `?filterBy=state`
- **Request/Response Fields:** camelCase: `access_code` → `accessCode` (in API payloads)

### Documentation Style

#### Code Comments
- **Inline Comments:** Explain "why," not "what"
  ```javascript
  // Validate state transition: OPEN → CLOSED only
  if (currentState === 'CLOSED' && newState === 'OPEN') {
    throw new Error('Cannot reopen closed event');
  }
  ```

- **Function/Method Documentation:** JSDoc format
  ```javascript
  /**
   * Generate a unique alphanumeric access code for an event.
   * @param {number} length - Code length (default: 11)
   * @returns {string} - Access code (e.g., "ABC-123-XYZ")
   */
  function generateAccessCode(length = 11) {
    // Implementation
  }
  ```

#### README & Documentation
- **Structure:**
  - Clear headings and table of contents
  - Concise paragraphs with code examples
  - Screenshots or diagrams where helpful
  - Setup and run instructions
- **Tone:** Professional, technical, concise
- **Examples:** Include real-world examples for API endpoints

#### Commit Messages
- **Format:** `<type>(<scope>): <subject>`
- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Example:** `feat(auth): implement JWT-based authentication`
- **Length:** Subject ≤ 50 characters; body ≤ 72 characters

### Code Quality Standards

#### Quality Metrics
- **Code Coverage:** Minimum 60% (Phase 2 goal: 80%)
- **Linting:** Zero ESLint errors (warnings acceptable)
- **Formatting:** Enforced via Prettier
- **Duplication:** Max 3% code duplication (SonarQube or similar)

#### Best Practices
- **DRY Principle:** No code duplication; extract common logic
- **SOLID Principles:** Single responsibility, open/closed, etc.
- **Error Handling:** All promises rejected; try-catch in async functions
- **Validation:** Input validation at API boundaries
- **Security:**
  - Sanitize user input (prevent SQL injection via Sequelize)
  - Hash passwords with bcrypt (minimum 10 rounds)
  - CORS configured appropriately
  - JWT secrets not hardcoded
  - No sensitive data in logs

#### Code Review Checklist
- [ ] Follows naming conventions
- [ ] No console.log() in production code
- [ ] Error handling implemented
- [ ] No hardcoded values
- [ ] Comments explain complex logic
- [ ] Tests provided (if applicable)
- [ ] No unnecessary dependencies added

### Deployment Expectations

#### Development Environment
- Node.js 18+ LTS
- PostgreSQL 12+ or MySQL 8+
- npm or yarn package manager
- Git version control

#### Environment Configuration
- `.env` file with variables (never committed)
- Sample `.env.example` provided
- Environment variables:
  - `NODE_ENV`: 'development' | 'production'
  - `DATABASE_URL`: Database connection string
  - `JWT_SECRET`: Secret key for JWT signing
  - `API_BASE_URL`: Backend API URL
  - `FRONTEND_URL`: Frontend application URL
  - `CORS_ORIGIN`: Allowed CORS origin
  - `QR_API_BASE_URL`: QRServer or alternative

#### Build & Deployment
- **Backend:**
  - Install: `npm install`
  - Run: `npm start` or `node server.js`
  - Development: `npm run dev` (with nodemon)
  - Build: `npm run build` (if applicable)

- **Frontend:**
  - Install: `npm install`
  - Development: `npm start` (dev server)
  - Build: `npm run build` (production bundle)
  - Test: `npm test`

#### Database Migrations
- Use Sequelize migrations for schema changes
- Version control migration files
- Document migration procedures

#### Testing in Production
- Smoke tests before rollout
- Monitoring and error tracking (e.g., Sentry)
- Database backup before migrations
- Rollback plan documented

---

## Repository Structure

```
event-attendance-system/
├── .github/
│   ├── workflows/              # GitHub Actions CI/CD (Phase 2+)
│   └── ISSUE_TEMPLATE/
├── backend/
│   ├── config/
│   │   ├── database.js         # Sequelize configuration
│   │   └── env.js              # Environment setup
│   ├── models/                 # Sequelize models
│   │   ├── User.js
│   │   ├── EventGroup.js
│   │   ├── Event.js
│   │   └── CheckIn.js
│   ├── controllers/            # Business logic
│   │   ├── AuthController.js
│   │   ├── EventGroupController.js
│   │   ├── EventController.js
│   │   └── CheckInController.js
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js
│   │   ├── eventGroupRoutes.js
│   │   ├── eventRoutes.js
│   │   └── checkInRoutes.js
│   ├── middleware/             # Express middleware
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── services/               # Business services
│   │   ├── authService.js
│   │   ├── eventService.js
│   │   ├── qrCodeService.js
│   │   └── exportService.js
│   ├── utils/                  # Utility functions
│   │   ├── generateAccessCode.js
│   │   ├── passwordHash.js
│   │   └── errorFormatter.js
│   ├── migrations/             # Sequelize migrations
│   │   ├── 20251102-create-users.js
│   │   ├── 20251102-create-event-groups.js
│   │   ├── 20251102-create-events.js
│   │   └── 20251102-create-check-ins.js
│   ├── seeders/                # Database seeders (optional)
│   ├── tests/                  # Unit & integration tests
│   │   ├── unit/
│   │   └── integration/
│   ├── .env.example            # Example environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── server.js               # Express server entry point
│   └── README.md               # Backend-specific README
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   ├── EventGroup/
│   │   │   │   ├── EventGroupForm.jsx
│   │   │   │   └── EventGroupList.jsx
│   │   │   ├── Event/
│   │   │   │   ├── EventForm.jsx
│   │   │   │   ├── EventList.jsx
│   │   │   │   └── EventDetails.jsx
│   │   │   ├── CheckIn/
│   │   │   │   ├── TextCheckInForm.jsx
│   │   │   │   ├── QRCodeScanner.jsx
│   │   │   │   └── CheckInModal.jsx
│   │   │   ├── Attendance/
│   │   │   │   ├── AttendanceList.jsx
│   │   │   │   └── ExportButton.jsx
│   │   │   └── Common/
│   │   │       ├── Header.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── LoadingSpinner.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EventGroupsPage.jsx
│   │   │   ├── EventDetailsPage.jsx
│   │   │   ├── CheckInPage.jsx
│   │   │   ├── AttendancePage.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/           # API services
│   │   │   ├── apiClient.js    # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── eventService.js
│   │   │   └── checkInService.js
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useFetchEvents.js
│   │   │   └── useFetchAttendance.js
│   │   ├── context/            # React Context
│   │   │   └── AuthContext.js
│   │   ├── utils/              # Utility functions
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   └── qrCodeUtils.js
│   │   ├── styles/             # CSS/SCSS
│   │   │   ├── index.css
│   │   │   └── variables.css
│   │   ├── App.jsx             # Main app component
│   │   ├── App.css
│   │   └── index.jsx           # React entry point
│   ├── public/                 # Static assets
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── .env.example            # Example environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js or craco.config.js
│   └── README.md               # Frontend-specific README
├── docs/                       # Project documentation
│   ├── ARCHITECTURE.md         # Architecture documentation
│   ├── API.md                  # API documentation
│   ├── DATABASE_SCHEMA.md      # Database schema
│   ├── SETUP.md                # Setup instructions
│   └── DEPLOYMENT.md           # Deployment guide
├── .gitignore                  # Root .gitignore
├── .gitattributes              # Git LFS config (optional)
├── README.md                   # Root README
├── PHASE_1_SPECIFICATION.md    # This file
├── package.json                # Root package.json (optional, for monorepo)
└── CONTRIBUTING.md             # Contribution guidelines
```

---

## Git Commit Strategy

### Branching Model: GitHub Flow Simplified

#### Main Branches
- **`main`:** Production-ready code, tagged with version numbers
- **`develop`:** Integration branch for features, stable but not production-ready

#### Supporting Branches
- **Feature Branches:** `feature/TASK-ID-short-description`
  - Created from: `develop`
  - Merged back into: `develop`
  - Naming: `feature/EV-001-event-creation`, `feature/auth-login`

- **Bugfix Branches:** `bugfix/TASK-ID-short-description`
  - Created from: `develop`
  - Merged back into: `develop`
  - Naming: `bugfix/check-in-validation`

- **Hotfix Branches:** `hotfix/critical-issue`
  - Created from: `main` (for critical production bugs)
  - Merged into: `main` and `develop`
  - Naming: `hotfix/security-patch`

### Commit Message Format

**Format:** `<type>(<scope>): <subject>`

**Structure:**
```
feat(auth): implement JWT-based authentication

- Add JWT token generation and validation
- Implement refresh token mechanism
- Add token expiration logic

Closes #42
```

**Rules:**
1. Subject line: ≤ 50 characters
2. Use imperative mood: "add" not "added" or "adds"
3. Do not capitalize subject line
4. Do not end with period
5. Body: Wrapped at 72 characters, separated from subject by blank line
6. Footer: Reference issues with `Closes #`, `Fixes #`, `Resolves #`

**Commit Types:**
| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code formatting (no logic change) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding/modifying tests |
| `chore` | Dependency updates, tooling |
| `ci` | CI/CD configuration changes |

**Examples:**
```
feat(event-creation): add event form validation
fix(check-in): prevent duplicate check-ins for same participant
docs(api): update endpoint documentation
style(prettier): format code with prettier config
refactor(auth): extract password validation to utility
test(event-service): add unit tests for event creation
chore(deps): update express to 4.18.2
```

### Pull Request (PR) Workflow

#### PR Naming
- **Format:** Same as commit: `feat(scope): description`
- **Example:** `feat(qr-code): integrate QR code scanning`

#### PR Description Template
```markdown
## Description
Brief description of changes and motivation.

## Changes
- Bullet point 1
- Bullet point 2

## Testing
Describe how this was tested.

## Screenshots
[If applicable: Add screenshots of UI changes]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes
```

#### Review Requirements
- **Minimum Reviewers:** 2 approvals
- **Automated Checks:** ESLint, tests, build must pass
- **Scope Validation:** Changes should be focused on single feature/fix

### Version Tagging

**Format:** Semantic Versioning (SemVer) - `v<MAJOR>.<MINOR>.<PATCH>`

| Scenario | Increment |
|----------|-----------|
| Breaking API change | Major (v1.0.0 → v2.0.0) |
| New feature, backward compatible | Minor (v1.0.0 → v1.1.0) |
| Bug fix, backward compatible | Patch (v1.0.0 → v1.0.1) |

**Example Tags:**
```
v1.0.0 - Phase 1 Release
v1.1.0 - Phase 2 Release
v1.0.1 - Hotfix for security issue
```

### Commit Frequency & Hygiene

- **Commit Size:** Logical units, not too large or small
- **Frequency:** At least daily when actively developing
- **No WIP Commits:** Avoid "work in progress" commits to main branches
- **Rebase Before Merge:** Keep history clean; rebase feature branches before merging
- **No Merge Commits from Main:** Use squash merge for feature branches if desired

---

## Appendix A: Technology Resources

### Recommended Reading & Documentation
- React: https://react.dev
- Express.js: https://expressjs.com
- Sequelize: https://sequelize.org
- JWT: https://jwt.io
- QRServer API: https://qr-server.com

### Tools & Libraries
- **Postman:** API testing tool
- **DBeaver:** Database management tool
- **Git GUI:** GitKraken, GitHub Desktop
- **Code Editor:** Visual Studio Code with extensions
- **Testing:** Jest, Supertest (for API testing)

---

## Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-06 | Development Team | Initial Phase 1 specification |

---

**End of Specification Document**

This specification serves as the foundation for all development activities in Phase 1. Regular updates to this document will be made as the project evolves and requirements are clarified.

**Next Review Date:** After Phase 1 completion (November 16, 2025)  
**Next Update:** Phase 2 Planning (December 6, 2025)
