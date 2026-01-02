  Event Attendance Monitoring System
 Phase  - Core Implementation

A comprehensive web application for managing event attendance through multiple check-in methods (text codes and QR codes). Built with React (frontend), Node.js/Express (backend), and PostgreSQL/MySQL (database).

Status:  Phase  Complete (November , )  
Current Phase:  Phase  In Progress  
Final Demo:  Last Tutorial Session

---

  Quick Navigation

 Essential Documentation
- [Phase  Specification](./PHASE__SPECIFICATION.md) - Complete -page technical specification
- [Project Plan](./PROJECT_PLAN.md) - Gantt-style timeline and milestones
- [ER Diagram](./docs/ER_DIAGRAM.md) - Database entity relationships

 Implementation Guides
- [Architecture & Design](./docs/ARCHITECTURE.md) - System design and data flows
- [API Documentation](./docs/API.md) -  REST endpoints with examples
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Tables, constraints, and indices

 Getting Started
- [Setup & Installation](./docs/SETUP.md) - Environment configuration (all OS)
- [Deployment Guide](./docs/DEPLOYMENT.md) -  deployment strategies
- [Contributing Guide](./CONTRIBUTING.md) - Development standards

 Status & Reference
- [Project Summary](./PROJECT_SUMMARY.md) - Quick reference guide
- [Status](./STATUS.txt) - Current project state
- [Manifest](./MANIFEST.md) - File listing and organization

---

  Project Overview

 What is This?
The Event Attendance Monitoring System is a web application that simplifies attendance tracking for organized events (conferences, seminars, workshops, classes, etc.). It provides two user roles with distinct workflows:

Event Organizers (EOs):
- Create and manage event groups
- Define individual events with start/end times
- Generate text-based access codes for manual check-in
- Generate QR codes for scanning-based check-in
- Toggle event state (OPEN for check-ins / CLOSED to stop accepting)
- View real-time attendance lists
- Export attendance data to CSV and XLSX formats

Participants:
- Check in using text access code (manual entry)
- Check in using QR code (phone camera scan)
- See confirmation of successful check-in

 Why Build This?
Traditional attendance tracking (pen & paper, sign-up sheets) is inefficient and error-prone. This system:
-  Eliminates manual data entry errors
-  Enables real-time attendance insights
-  Supports contactless check-in (QR codes)
-  Provides instant data export for reporting
-  Scales from small workshops to large conferences

 Phase  Deliverables ( COMPLETE)
-  User authentication system (register/login)
-  Event group management (create, read, update, delete)
-  Event management with access codes
-  Text-based check-in endpoint
-  Basic QR code generation
-  Attendance tracking
-  CSV export functionality
-  React dashboard for EOs
-  Participant check-in portal
-  Comprehensive documentation

---

 ️ Architecture Overview

 Three-Tier Architecture

```
┌─────────────────────────────────────────┐
│        PRESENTATION LAYER               │
│  React + Single Page Application      │
│  - Event Organizer Dashboard            │
│  - Participant Check-In Portal          │
│  - Real-time Attendance Display         │
└──────────────┬──────────────────────────┘
               │ HTTP/HTTPS
               ▼
┌─────────────────────────────────────────┐
│      APPLICATION/API LAYER              │
│  Node.js Express.js REST API            │
│  - Authentication (JWT)                 │
│  - Event Management                     │
│  - Check-In Processing                  │
│  - Data Export (CSV/XLSX)               │
│  - QR Code Generation                   │
└──────────────┬──────────────────────────┘
               │ ORM (Sequelize)
               ▼
┌─────────────────────────────────────────┐
│      DATA PERSISTENCE LAYER             │
│  PostgreSQL / MySQL Database            │
│  - users (Event Organizers)             │
│  - event_groups (Event Groupings)       │
│  - events (Individual Events)           │
│  - attendance (Check-In Records)        │
└─────────────────────────────────────────┘
```

 External Services

QRServer API (https://qrserver.com)
- Generates QR codes from access codes
- Free, no authentication required
- Returns image URLs for embedding
- Fallback: Use text codes if API unavailable

---

  Technology Stack

 Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | + | UI framework and state management |
| React Router | + | Client-side routing |
| Axios | Latest | HTTP client for API calls |
| React Bootstrap | + | Pre-built UI components |
| React Hook Form | + | Efficient form state management |
| html-qrcode | Latest | QR code scanning (Phase ) |

 Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | + LTS | JavaScript runtime |
| Express.js | + | REST API framework |
| Sequelize | + | ORM for database operations |
| PostgreSQL | + | Primary relational database |
| MySQL | + | Alternative relational database |
| JWT | N/A | Stateless authentication |
| bcryptjs | + | Password hashing and security |

 Development & DevOps
| Tool | Purpose |
|------|---------|
| Git | Version control |
| GitHub | Repository hosting |
| ESLint | Code quality linting |
| Prettier | Code formatting (-space indents) |
| Jest | Unit & integration testing |
| Postman | API testing and documentation |
| Docker | Containerization (Phase ) |
| GitHub Actions | CI/CD pipeline (Phase ) |

---

  Repository Structure

```
event-attendance-system/
│
├──  README.md                            This file
├──  PHASE__SPECIFICATION.md             Complete Phase  spec (+ pages)
├──  PROJECT_PLAN.md                      Gantt chart and milestones
├──  PROJECT_SUMMARY.md                   Quick reference guide
├──  CONTRIBUTING.md                      Development guidelines
├──  STATUS.txt                           Current project status
├──  INDEX.md                             Documentation index
├──  MANIFEST.md                          File manifest
├──  .gitignore                           Git ignore rules
│
├──  backend/
│   ├── config/
│   │   ├── database.js                     Database configuration
│   │   └── environment.js                  Environment variables
│   │
│   ├── models/
│   │   ├── User.js                         Event Organizer model
│   │   ├── EventGroup.js                   Event Group model
│   │   ├── Event.js                        Event model
│   │   └── Attendance.js                   Check-in records model
│   │
│   ├── controllers/
│   │   ├── authController.js               Authentication logic
│   │   ├── eventGroupController.js         Event group management
│   │   ├── eventController.js              Event management
│   │   └── attendanceController.js         Check-in & attendance
│   │
│   ├── routes/
│   │   ├── auth.js                         Auth endpoints
│   │   ├── eventGroups.js                  Event group endpoints
│   │   ├── events.js                       Event endpoints
│   │   └── attendance.js                   Check-in endpoints
│   │
│   ├── middleware/
│   │   ├── auth.js                         JWT verification
│   │   ├── errorHandler.js                 Error handling
│   │   └── validation.js                   Input validation
│   │
│   ├── services/
│   │   ├── qrCodeService.js                QR code generation
│   │   ├── exportService.js                CSV/XLSX export
│   │   └── emailService.js                 Email notifications
│   │
│   ├── migrations/
│   │   └── [timestamp]-init.js             Database migrations
│   │
│   ├── .env.example                        Environment template (+ vars)
│   ├── server.js                           Express app entry point
│   ├── package.json                        Dependencies
│   └── README.md                           Backend setup guide
│
├──  frontend/
│   ├── public/
│   │   ├── index.html                      Main HTML file
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                  Navigation component
│   │   │   ├── EventForm.jsx               Event creation form
│   │   │   ├── CheckInForm.jsx             Check-in form
│   │   │   ├── AttendanceTable.jsx         Attendance display
│   │   │   └── QRScanner.jsx               QR scanner (Phase )
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx               Authentication page
│   │   │   ├── DashboardPage.jsx           EO dashboard
│   │   │   ├── EventPage.jsx               Event management page
│   │   │   ├── CheckInPage.jsx             Participant check-in page
│   │   │   └── AttendancePage.jsx          Attendance view page
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                      Axios instance
│   │   │   ├── authService.js              Auth API calls
│   │   │   ├── eventService.js             Event API calls
│   │   │   └── attendanceService.js        Attendance API calls
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js                  Authentication hook
│   │   │   ├── useEvents.js                Event fetching hook
│   │   │   └── useForm.js                  Form handling hook
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx             Auth state context
│   │   │   └── EventContext.jsx            Event state context
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js               Date/data formatting
│   │   │   ├── validators.js               Input validation
│   │   │   └── constants.js                App constants
│   │   │
│   │   ├── App.jsx                         Main app component
│   │   ├── index.jsx                       Entry point
│   │   └── index.css                       Global styles
│   │
│   ├── .env.example                        Environment template (+ vars)
│   ├── package.json                        Dependencies
│   └── README.md                           Frontend setup guide
│
└──  docs/
    ├── ARCHITECTURE.md                     System design ( pages)
    ├── API.md                              REST API reference ( pages)
    ├── DATABASE_SCHEMA.md                  Database design ( pages)
    ├── ER_DIAGRAM.md                       Entity relationships
    ├── SETUP.md                            Setup instructions ( pages)
    ├── DEPLOYMENT.md                       Deployment guides ( pages)
    ├── FAQ.md                              Frequently asked questions
    └── TROUBLESHOOTING.md                  Common issues and fixes
```

---

  Quick Start

 Prerequisites
- Node.js + LTS ([Download](https://nodejs.org/))
- PostgreSQL + ([Download](https://www.postgresql.org/)) or MySQL + ([Download](https://www.mysql.com/))
- Git ([Download](https://git-scm.com/))
- npm or yarn (comes with Node.js)

 Installation ( minutes)

Step : Clone and navigate
```bash
git clone https://github.com/your-org/event-attendance-system.git
cd event-attendance-system
```

Step : Backend setup
```bash
cd backend
npm install
cp .env.example .env
 Edit .env with your database credentials and secrets
npm run migrate         Create database tables
npm run dev            Start server (port )
```

Step : Frontend setup (new terminal)
```bash
cd frontend
npm install
cp .env.example .env   Verify REACT_APP_API_URL=http://localhost:
npm start              Start dev server (port )
```

Step : Access the application
- Frontend: http://localhost:
- Backend API: http://localhost:/api
- API Docs: http://localhost:/api/docs (if available)

---

  Functional Requirements

 User Roles & Workflows

Event Organizer (EO)
. Register/Login with email and password
. Create event groups (e.g., "Conference ")
. Add events to groups with:
   - Event name, description
   - Start and end times
   - Event state (OPEN/CLOSED)
   - Auto-generated access code
   - Auto-generated QR code URL
. Toggle event state to enable/disable check-ins
. View real-time attendance list for any event
. Export attendance to CSV or XLSX (Phase )

Participant
. Navigate to check-in portal (no login required)
. Check in using either:
   - Text Code: Enter event access code manually
   - QR Code: Scan event QR code with phone
. Provide name and optional email
. Receive confirmation message

 Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| User Authentication |  Phase  | Register, login with JWT tokens |
| Event Groups |  Phase  | Create, read, update, delete groups |
| Event Management |  Phase  | Create events with codes/QR |
| Text Check-In |  Phase  | Check in using access code |
| QR Generation |  Phase  | Generate QR codes via QRServer |
| QR Scanning |  Phase  | Scan QR codes for check-in |
| Attendance Viewing |  Phase  | Real-time attendance list |
| CSV Export |  Phase  | Export attendance to CSV |
| XLSX Export |  Phase  | Export attendance to Excel |
| Advanced Filtering |  Phase  | Filter by date, name, method |
| Responsive Design |  Phase  | Mobile, tablet, desktop views |
| Testing Suite |  Phase  | %+ test coverage |

---

 ️ Data Model

  Core Tables

```
users (Event Organizers)
├── id (UUID, PK)
├── email (UNIQUE)
├── password_hash
├── name
└── timestamps

event_groups (Event Collections)
├── id (UUID, PK)
├── user_id (FK → users)
├── name
├── description
└── timestamps

events (Individual Events)
├── id (UUID, PK)
├── event_group_id (FK → event_groups)
├── name
├── state (OPEN/CLOSED)
├── access_code (UNIQUE)
├── qr_code_url
├── start_date, end_date
└── timestamps

attendance (Check-In Records)
├── id (UUID, PK)
├── event_id (FK → events)
├── participant_name
├── participant_email
├── check_in_method (TEXT/QR)
├── checked_in_at
└── timestamps
```

For detailed schema, see [ER_DIAGRAM.md](./docs/ER_DIAGRAM.md)

---

  API Overview

  Total Endpoints

Authentication ( endpoints)
- `POST /api/auth/register` - Create EO account
- `POST /api/auth/login` - Authenticate EO

Event Groups ( endpoints)
- `GET /api/event-groups` - List all groups
- `POST /api/event-groups` - Create new group
- `GET /api/event-groups/:id` - Get single group
- `PUT /api/event-groups/:id` - Update group
- `DELETE /api/event-groups/:id` - Delete group

Events ( endpoints)
- `GET /api/event-groups/:groupId/events` - List group events
- `POST /api/event-groups/:groupId/events` - Create event
- `GET /api/events/:eventId` - Get event details
- `PUT /api/events/:eventId` - Update event
- `DELETE /api/events/:eventId` - Delete event

Check-In ( endpoints)
- `POST /api/events/:eventId/check-in/text` - Text check-in
- `POST /api/events/:eventId/check-in/qr` - QR check-in (Phase )
- `GET /api/events/:eventId/attendance` - Get attendees

Export ( endpoints)
- `GET /api/events/:eventId/attendance/export/csv` - Export CSV
- `GET /api/events/:eventId/attendance/export/xlsx` - Export XLSX (Phase )

For complete API specs, see [API.md](./docs/API.md)

---

  External Services

 QRServer API

What: Free QR code generation service  
URL: https://qrserver.com/api/v/create-qr-code/  
Used For: Generate QR codes from event access codes  
Reliability: No authentication needed, globally distributed  
Fallback: If service unavailable, events still work with text codes

Example:
```
Input: Event access code "ABC"
→ Request to QRServer
→ Returns URL: https://api.qrserver.com/v/create-qr-code/?size=x&data=ABC
→ Store URL in events.qr_code_url
→ Display QR code in UI
```

---

  Project Timeline

 Phase : Foundation (November -, )
Status:  COMPLETE

| Week | Tasks | Deadline |
|------|-------|----------|
| Week  | Project setup, architecture, database design | Nov  |
| Week  | API specification, backend implementation | Nov  |
| Week  | Frontend implementation, testing | Nov  |
| Phase  | Documentation, integration testing | Nov   |

Phase  Deliverables:
-   REST API endpoints
-  -table database schema
-  React dashboard and portal
-  Text-based check-in
-  CSV export
-  ,+ lines of documentation

 Phase : Polish & Enhancement (November  - December , )
Status:  IN PROGRESS

| Task | Duration | Target |
|------|----------|--------|
| QR code scanning integration |  days | Nov  |
| XLSX export & filtering |  days | Nov  |
| UI/UX refinement |  days | Nov  |
| Testing & coverage (%→%) |  days | Nov  |
| Deployment preparation |  days | Dec  |
| Code review & final QA |  days | Dec  |
| Demo preparation |  days | Dec  |
| Final deployment |  day | Dec  |

Phase  Deliverables:
-  QR code scanning
-  XLSX export
-   %+ test coverage
-  Responsive design
-  Production deployment

 Final Demo
Date: Last Tutorial Session  
Format: Live application demonstration  
Duration: ~ hour with Q&A

---

  Documentation

All documentation follows this hierarchy:

. START HERE → [README.md](./README.md) (this file)
. QUICK OVERVIEW → [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
. FULL SPECIFICATION → [PHASE__SPECIFICATION.md](./PHASE__SPECIFICATION.md)
. TECHNICAL DETAILS:
   - Architecture: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
   - API: [docs/API.md](./docs/API.md)
   - Database: [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)
   - ER Diagram: [docs/ER_DIAGRAM.md](./docs/ER_DIAGRAM.md)
. IMPLEMENTATION:
   - Setup: [docs/SETUP.md](./docs/SETUP.md)
   - Deployment: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
   - Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)
. PROJECT MANAGEMENT:
   - Timeline: [PROJECT_PLAN.md](./PROJECT_PLAN.md)
   - Index: [INDEX.md](./INDEX.md)

---

  Development Workflow

 Step : Understand Requirements
. Read relevant section in [PHASE__SPECIFICATION.md](./PHASE__SPECIFICATION.md)
. Review API specs in [docs/API.md](./docs/API.md)
. Check database schema in [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)

 Step : Setup Development Environment
```bash
 Follow setup guide
cd docs
cat SETUP.md
```

 Step : Create Feature Branch
```bash
git checkout -b feature/TASK-ID-description
 Example: git checkout -b feature/AUTH--add-password-reset
```

 Step : Develop & Test
- Follow code standards in [CONTRIBUTING.md](./CONTRIBUTING.md)
- Test locally: `npm test`
- Lint code: `npm run lint`
- Format code: `npm run format`

 Step : Commit & Push
```bash
git add .
git commit -m "feat(scope): clear description"
 Example: git commit -m "feat(auth): implement JWT token refresh"
git push origin feature/TASK-ID-description
```

 Step : Create Pull Request
- Link to issue or task
- Describe changes clearly
- Request  code reviews
- Ensure CI/CD passes

---

  Phase  Success Criteria

-  All  core features implemented
-   API endpoints functional
-  Database schema normalized (NF)
-  Frontend basic UI complete
-  Authentication working (JWT)
-  Text check-in operational
-  CSV export functional
-  %+ test coverage
-  All documentation complete
-  Code review approved

Phase  Status:  COMPLETE (November , )

---

  What's Next (Phase )

 Immediate Actions
. Review [Phase  requirements](./PHASE__SPECIFICATION.mdphase--requirements)
. Setup QR scanning library (`html-qrcode`)
. Implement XLSX export package (`exceljs`)
. Increase test coverage from % to %
. Polish UI for mobile responsiveness

 Phase  Timeline
- Nov -: QR scanning integration
- Nov -: XLSX export & filtering
- Nov -: UI/UX refinement
- Nov -: Testing & QA
- Nov -Dec : Deployment setup
- Dec -: Code review & fixes
- Dec -: Demo preparation
- Dec : Final deployment & handoff

 Key Resources
- [PHASE__SPECIFICATION.md](./PHASE__SPECIFICATION.md) - Phase  section
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - Detailed timeline
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deployment options

---

  Troubleshooting

 Common Issues

Q: Backend server won't start
```bash
 Check if port  is in use
lsof -i :   macOS/Linux
netstat -ano | findstr :   Windows

 Change PORT in backend/.env if needed
PORT=
```

Q: Database connection error
```bash
 Verify .env has correct credentials
 Check PostgreSQL is running
psql -U username -h localhost -d database_name

 Or for MySQL
mysql -u username -p -h localhost
```

Q: CORS errors in frontend
```bash
 Verify backend .env has correct CORS settings
CORS_ORIGIN=http://localhost:

 Restart backend server after changes
```

Q: "Module not found" errors
```bash
 Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

For more help, see [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) or create an issue.

---

  Support & Contact

- Issues: Create GitHub issue with detailed description
- Questions: Check [FAQ.md](./docs/FAQ.md)
- Documentation: See [INDEX.md](./INDEX.md) for full index
- Contact: [Your contact info or email]

---

  File Manifest

| File/Folder | Purpose | Lines |
|-------------|---------|-------|
| README.md | This guide | ~ |
| PHASE__SPECIFICATION.md | Full specification | ~ |
| PROJECT_PLAN.md | Timeline and milestones | ~ |
| PROJECT_SUMMARY.md | Quick reference | ~ |
| docs/ARCHITECTURE.md | System design | ~ |
| docs/API.md | API reference | ~ |
| docs/DATABASE_SCHEMA.md | Database design | ~ |
| docs/ER_DIAGRAM.md | Entity relationships | ~ |
| docs/SETUP.md | Setup guide | ~ |
| docs/DEPLOYMENT.md | Deployment guide | ~ |

Total Documentation: ,+ lines (+ pages)

---

  License

This project is part of a university assignment. All code and documentation are provided for educational purposes.

---

  Project Credits

Course: Web Technology Project  
Semester: Fall   
Team: Echipa 1 EN  
Last Updated: December ,   
Status: Phase   COMPLETE | Phase   IN PROGRESS


