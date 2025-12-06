# 📋 Event Attendance Monitoring System
## Phase 1 - Core Implementation

A comprehensive web application for managing event attendance through multiple check-in methods (text codes and QR codes). Built with **React** (frontend), **Node.js/Express** (backend), and **PostgreSQL/MySQL** (database).

**Status:** ✅ Phase 1 Complete (November 16, 2025)  
**Current Phase:** 🔄 Phase 2 In Progress  
**Final Demo:** 📅 Last Tutorial Session

---

## 📑 Quick Navigation

### Essential Documentation
- **[Phase 1 Specification](./PHASE_1_SPECIFICATION.md)** - Complete 120-page technical specification
- **[Project Plan](./PROJECT_PLAN.md)** - Gantt-style timeline and milestones
- **[ER Diagram](./docs/ER_DIAGRAM.md)** - Database entity relationships

### Implementation Guides
- **[Architecture & Design](./docs/ARCHITECTURE.md)** - System design and data flows
- **[API Documentation](./docs/API.md)** - 18 REST endpoints with examples
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Tables, constraints, and indices

### Getting Started
- **[Setup & Installation](./docs/SETUP.md)** - Environment configuration (all OS)
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - 4 deployment strategies
- **[Contributing Guide](./CONTRIBUTING.md)** - Development standards

### Status & Reference
- **[Project Summary](./PROJECT_SUMMARY.md)** - Quick reference guide
- **[Status](./STATUS.txt)** - Current project state
- **[Manifest](./MANIFEST.md)** - File listing and organization

---

## 🎯 Project Overview

### What is This?
The Event Attendance Monitoring System is a web application that simplifies attendance tracking for organized events (conferences, seminars, workshops, classes, etc.). It provides two user roles with distinct workflows:

**Event Organizers (EOs):**
- Create and manage event groups
- Define individual events with start/end times
- Generate text-based access codes for manual check-in
- Generate QR codes for scanning-based check-in
- Toggle event state (OPEN for check-ins / CLOSED to stop accepting)
- View real-time attendance lists
- Export attendance data to CSV and XLSX formats

**Participants:**
- Check in using text access code (manual entry)
- Check in using QR code (phone camera scan)
- See confirmation of successful check-in

### Why Build This?
Traditional attendance tracking (pen & paper, sign-up sheets) is inefficient and error-prone. This system:
- ✅ Eliminates manual data entry errors
- ✅ Enables real-time attendance insights
- ✅ Supports contactless check-in (QR codes)
- ✅ Provides instant data export for reporting
- ✅ Scales from small workshops to large conferences

### Phase 1 Deliverables (✅ COMPLETE)
- ✅ User authentication system (register/login)
- ✅ Event group management (create, read, update, delete)
- ✅ Event management with access codes
- ✅ Text-based check-in endpoint
- ✅ Basic QR code generation
- ✅ Attendance tracking
- ✅ CSV export functionality
- ✅ React dashboard for EOs
- ✅ Participant check-in portal
- ✅ Comprehensive documentation

---

## 🏗️ Architecture Overview

### Three-Tier Architecture

```
┌─────────────────────────────────────────┐
│        PRESENTATION LAYER               │
│  React 18+ Single Page Application      │
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

### External Services

**QRServer API** (https://qrserver.com)
- Generates QR codes from access codes
- Free, no authentication required
- Returns image URLs for embedding
- Fallback: Use text codes if API unavailable

---

## 💻 Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18+ | UI framework and state management |
| React Router | 6+ | Client-side routing |
| Axios | Latest | HTTP client for API calls |
| React Bootstrap | 2+ | Pre-built UI components |
| React Hook Form | 7+ | Efficient form state management |
| html5-qrcode | Latest | QR code scanning (Phase 2) |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ LTS | JavaScript runtime |
| Express.js | 4+ | REST API framework |
| Sequelize | 6+ | ORM for database operations |
| PostgreSQL | 12+ | Primary relational database |
| MySQL | 8+ | Alternative relational database |
| JWT | N/A | Stateless authentication |
| bcryptjs | 2+ | Password hashing and security |

### Development & DevOps
| Tool | Purpose |
|------|---------|
| Git | Version control |
| GitHub | Repository hosting |
| ESLint | Code quality linting |
| Prettier | Code formatting (2-space indents) |
| Jest | Unit & integration testing |
| Postman | API testing and documentation |
| Docker | Containerization (Phase 2) |
| GitHub Actions | CI/CD pipeline (Phase 2) |

---

## 📁 Repository Structure

```
event-attendance-system/
│
├── 📄 README.md                           # This file
├── 📄 PHASE_1_SPECIFICATION.md            # Complete Phase 1 spec (120+ pages)
├── 📄 PROJECT_PLAN.md                     # Gantt chart and milestones
├── 📄 PROJECT_SUMMARY.md                  # Quick reference guide
├── 📄 CONTRIBUTING.md                     # Development guidelines
├── 📄 STATUS.txt                          # Current project status
├── 📄 INDEX.md                            # Documentation index
├── 📄 MANIFEST.md                         # File manifest
├── 📄 .gitignore                          # Git ignore rules
│
├── 📂 backend/
│   ├── config/
│   │   ├── database.js                    # Database configuration
│   │   └── environment.js                 # Environment variables
│   │
│   ├── models/
│   │   ├── User.js                        # Event Organizer model
│   │   ├── EventGroup.js                  # Event Group model
│   │   ├── Event.js                       # Event model
│   │   └── Attendance.js                  # Check-in records model
│   │
│   ├── controllers/
│   │   ├── authController.js              # Authentication logic
│   │   ├── eventGroupController.js        # Event group management
│   │   ├── eventController.js             # Event management
│   │   └── attendanceController.js        # Check-in & attendance
│   │
│   ├── routes/
│   │   ├── auth.js                        # Auth endpoints
│   │   ├── eventGroups.js                 # Event group endpoints
│   │   ├── events.js                      # Event endpoints
│   │   └── attendance.js                  # Check-in endpoints
│   │
│   ├── middleware/
│   │   ├── auth.js                        # JWT verification
│   │   ├── errorHandler.js                # Error handling
│   │   └── validation.js                  # Input validation
│   │
│   ├── services/
│   │   ├── qrCodeService.js               # QR code generation
│   │   ├── exportService.js               # CSV/XLSX export
│   │   └── emailService.js                # Email notifications
│   │
│   ├── migrations/
│   │   └── [timestamp]-init.js            # Database migrations
│   │
│   ├── .env.example                       # Environment template (40+ vars)
│   ├── server.js                          # Express app entry point
│   ├── package.json                       # Dependencies
│   └── README.md                          # Backend setup guide
│
├── 📂 frontend/
│   ├── public/
│   │   ├── index.html                     # Main HTML file
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                 # Navigation component
│   │   │   ├── EventForm.jsx              # Event creation form
│   │   │   ├── CheckInForm.jsx            # Check-in form
│   │   │   ├── AttendanceTable.jsx        # Attendance display
│   │   │   └── QRScanner.jsx              # QR scanner (Phase 2)
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx              # Authentication page
│   │   │   ├── DashboardPage.jsx          # EO dashboard
│   │   │   ├── EventPage.jsx              # Event management page
│   │   │   ├── CheckInPage.jsx            # Participant check-in page
│   │   │   └── AttendancePage.jsx         # Attendance view page
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                     # Axios instance
│   │   │   ├── authService.js             # Auth API calls
│   │   │   ├── eventService.js            # Event API calls
│   │   │   └── attendanceService.js       # Attendance API calls
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js                 # Authentication hook
│   │   │   ├── useEvents.js               # Event fetching hook
│   │   │   └── useForm.js                 # Form handling hook
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx            # Auth state context
│   │   │   └── EventContext.jsx           # Event state context
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js              # Date/data formatting
│   │   │   ├── validators.js              # Input validation
│   │   │   └── constants.js               # App constants
│   │   │
│   │   ├── App.jsx                        # Main app component
│   │   ├── index.jsx                      # Entry point
│   │   └── index.css                      # Global styles
│   │
│   ├── .env.example                       # Environment template (20+ vars)
│   ├── package.json                       # Dependencies
│   └── README.md                          # Frontend setup guide
│
└── 📂 docs/
    ├── ARCHITECTURE.md                    # System design (15 pages)
    ├── API.md                             # REST API reference (30 pages)
    ├── DATABASE_SCHEMA.md                 # Database design (25 pages)
    ├── ER_DIAGRAM.md                      # Entity relationships
    ├── SETUP.md                           # Setup instructions (20 pages)
    ├── DEPLOYMENT.md                      # Deployment guides (20 pages)
    ├── FAQ.md                             # Frequently asked questions
    └── TROUBLESHOOTING.md                 # Common issues and fixes
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ LTS ([Download](https://nodejs.org/))
- PostgreSQL 12+ ([Download](https://www.postgresql.org/)) or MySQL 8+ ([Download](https://www.mysql.com/))
- Git ([Download](https://git-scm.com/))
- npm or yarn (comes with Node.js)

### Installation (5 minutes)

**Step 1: Clone and navigate**
```bash
git clone https://github.com/your-org/event-attendance-system.git
cd event-attendance-system
```

**Step 2: Backend setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials and secrets
npm run migrate        # Create database tables
npm run dev           # Start server (port 5000)
```

**Step 3: Frontend setup (new terminal)**
```bash
cd frontend
npm install
cp .env.example .env  # Verify REACT_APP_API_URL=http://localhost:5000
npm start             # Start dev server (port 3000)
```

**Step 4: Access the application**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **API Docs:** http://localhost:5000/api/docs (if available)

---

## 📊 Functional Requirements

### User Roles & Workflows

**Event Organizer (EO)**
1. Register/Login with email and password
2. Create event groups (e.g., "Conference 2025")
3. Add events to groups with:
   - Event name, description
   - Start and end times
   - Event state (OPEN/CLOSED)
   - Auto-generated access code
   - Auto-generated QR code URL
4. Toggle event state to enable/disable check-ins
5. View real-time attendance list for any event
6. Export attendance to CSV or XLSX (Phase 2)

**Participant**
1. Navigate to check-in portal (no login required)
2. Check in using either:
   - **Text Code:** Enter event access code manually
   - **QR Code:** Scan event QR code with phone
3. Provide name and optional email
4. Receive confirmation message

### Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| **User Authentication** | ✅ Phase 1 | Register, login with JWT tokens |
| **Event Groups** | ✅ Phase 1 | Create, read, update, delete groups |
| **Event Management** | ✅ Phase 1 | Create events with codes/QR |
| **Text Check-In** | ✅ Phase 1 | Check in using access code |
| **QR Generation** | ✅ Phase 1 | Generate QR codes via QRServer |
| **QR Scanning** | 🔄 Phase 2 | Scan QR codes for check-in |
| **Attendance Viewing** | ✅ Phase 1 | Real-time attendance list |
| **CSV Export** | ✅ Phase 1 | Export attendance to CSV |
| **XLSX Export** | 🔄 Phase 2 | Export attendance to Excel |
| **Advanced Filtering** | 🔄 Phase 2 | Filter by date, name, method |
| **Responsive Design** | 🔄 Phase 2 | Mobile, tablet, desktop views |
| **Testing Suite** | 🔄 Phase 2 | 80%+ test coverage |

---

## 🗄️ Data Model

### 4 Core Tables

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

## 🔌 API Overview

### 18 Total Endpoints

**Authentication (2 endpoints)**
- `POST /api/auth/register` - Create EO account
- `POST /api/auth/login` - Authenticate EO

**Event Groups (5 endpoints)**
- `GET /api/event-groups` - List all groups
- `POST /api/event-groups` - Create new group
- `GET /api/event-groups/:id` - Get single group
- `PUT /api/event-groups/:id` - Update group
- `DELETE /api/event-groups/:id` - Delete group

**Events (5 endpoints)**
- `GET /api/event-groups/:groupId/events` - List group events
- `POST /api/event-groups/:groupId/events` - Create event
- `GET /api/events/:eventId` - Get event details
- `PUT /api/events/:eventId` - Update event
- `DELETE /api/events/:eventId` - Delete event

**Check-In (3 endpoints)**
- `POST /api/events/:eventId/check-in/text` - Text check-in
- `POST /api/events/:eventId/check-in/qr` - QR check-in (Phase 2)
- `GET /api/events/:eventId/attendance` - Get attendees

**Export (2 endpoints)**
- `GET /api/events/:eventId/attendance/export/csv` - Export CSV
- `GET /api/events/:eventId/attendance/export/xlsx` - Export XLSX (Phase 2)

For complete API specs, see [API.md](./docs/API.md)

---

## 🔗 External Services

### QRServer API

**What:** Free QR code generation service  
**URL:** https://qrserver.com/api/v1/create-qr-code/  
**Used For:** Generate QR codes from event access codes  
**Reliability:** No authentication needed, globally distributed  
**Fallback:** If service unavailable, events still work with text codes

**Example:**
```
Input: Event access code "ABC12345"
→ Request to QRServer
→ Returns URL: https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ABC12345
→ Store URL in events.qr_code_url
→ Display QR code in UI
```

---

## 📅 Project Timeline

### Phase 1: Foundation (November 2-16, 2025)
**Status:** ✅ **COMPLETE**

| Week | Tasks | Deadline |
|------|-------|----------|
| **Week 1** | Project setup, architecture, database design | Nov 4 |
| **Week 2** | API specification, backend implementation | Nov 14 |
| **Week 2** | Frontend implementation, testing | Nov 15 |
| **Phase 1** | Documentation, integration testing | **Nov 16** ✅ |

**Phase 1 Deliverables:**
- ✅ 18 REST API endpoints
- ✅ 4-table database schema
- ✅ React dashboard and portal
- ✅ Text-based check-in
- ✅ CSV export
- ✅ 10,000+ lines of documentation

### Phase 2: Polish & Enhancement (November 17 - December 6, 2025)
**Status:** 🔄 **IN PROGRESS**

| Task | Duration | Target |
|------|----------|--------|
| QR code scanning integration | 3 days | Nov 19 |
| XLSX export & filtering | 2 days | Nov 21 |
| UI/UX refinement | 3 days | Nov 24 |
| Testing & coverage (60%→80%) | 4 days | Nov 28 |
| Deployment preparation | 3 days | Dec 1 |
| Code review & final QA | 2 days | Dec 3 |
| Demo preparation | 2 days | Dec 5 |
| Final deployment | 1 day | **Dec 6** |

**Phase 2 Deliverables:**
- 🔄 QR code scanning
- 🔄 XLSX export
- 🔄  80%+ test coverage
- 🔄 Responsive design
- ⏳ Production deployment

### Final Demo
**Date:** Last Tutorial Session  
**Format:** Live application demonstration  
**Duration:** ~1 hour with Q&A

---

## 📚 Documentation

All documentation follows this hierarchy:

1. **START HERE** → [README.md](./README.md) (this file)
2. **QUICK OVERVIEW** → [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
3. **FULL SPECIFICATION** → [PHASE_1_SPECIFICATION.md](./PHASE_1_SPECIFICATION.md)
4. **TECHNICAL DETAILS:**
   - Architecture: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
   - API: [docs/API.md](./docs/API.md)
   - Database: [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)
   - ER Diagram: [docs/ER_DIAGRAM.md](./docs/ER_DIAGRAM.md)
5. **IMPLEMENTATION:**
   - Setup: [docs/SETUP.md](./docs/SETUP.md)
   - Deployment: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
   - Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)
6. **PROJECT MANAGEMENT:**
   - Timeline: [PROJECT_PLAN.md](./PROJECT_PLAN.md)
   - Index: [INDEX.md](./INDEX.md)

---

## 🤝 Development Workflow

### Step 1: Understand Requirements
1. Read relevant section in [PHASE_1_SPECIFICATION.md](./PHASE_1_SPECIFICATION.md)
2. Review API specs in [docs/API.md](./docs/API.md)
3. Check database schema in [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)

### Step 2: Setup Development Environment
```bash
# Follow setup guide
cd docs
cat SETUP.md
```

### Step 3: Create Feature Branch
```bash
git checkout -b feature/TASK-ID-description
# Example: git checkout -b feature/AUTH-001-add-password-reset
```

### Step 4: Develop & Test
- Follow code standards in [CONTRIBUTING.md](./CONTRIBUTING.md)
- Test locally: `npm test`
- Lint code: `npm run lint`
- Format code: `npm run format`

### Step 5: Commit & Push
```bash
git add .
git commit -m "feat(scope): clear description"
# Example: git commit -m "feat(auth): implement JWT token refresh"
git push origin feature/TASK-ID-description
```

### Step 6: Create Pull Request
- Link to issue or task
- Describe changes clearly
- Request 2 code reviews
- Ensure CI/CD passes

---

## ✅ Phase 1 Success Criteria

- ✅ All 8 core features implemented
- ✅ 18 API endpoints functional
- ✅ Database schema normalized (3NF)
- ✅ Frontend basic UI complete
- ✅ Authentication working (JWT)
- ✅ Text check-in operational
- ✅ CSV export functional
- ✅ 60%+ test coverage
- ✅ All documentation complete
- ✅ Code review approved

**Phase 1 Status:** ✅ **COMPLETE** (November 16, 2025)

---

## 🔄 What's Next (Phase 2)

### Immediate Actions
1. Review [Phase 2 requirements](./PHASE_1_SPECIFICATION.md#phase-2-requirements)
2. Setup QR scanning library (`html5-qrcode`)
3. Implement XLSX export package (`exceljs`)
4. Increase test coverage from 60% to 80%
5. Polish UI for mobile responsiveness

### Phase 2 Timeline
- **Nov 17-19:** QR scanning integration
- **Nov 20-21:** XLSX export & filtering
- **Nov 22-24:** UI/UX refinement
- **Nov 25-28:** Testing & QA
- **Nov 29-Dec 1:** Deployment setup
- **Dec 2-3:** Code review & fixes
- **Dec 4-5:** Demo preparation
- **Dec 6:** Final deployment & handoff

### Key Resources
- [PHASE_1_SPECIFICATION.md](./PHASE_1_SPECIFICATION.md) - Phase 2 section
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - Detailed timeline
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deployment options

---

## 🐛 Troubleshooting

### Common Issues

**Q: Backend server won't start**
```bash
# Check if port 5000 is in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Change PORT in backend/.env if needed
PORT=5001
```

**Q: Database connection error**
```bash
# Verify .env has correct credentials
# Check PostgreSQL is running
psql -U username -h localhost -d database_name

# Or for MySQL
mysql -u username -p -h localhost
```

**Q: CORS errors in frontend**
```bash
# Verify backend .env has correct CORS settings
CORS_ORIGIN=http://localhost:3000

# Restart backend server after changes
```

**Q: "Module not found" errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

For more help, see [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) or create an issue.

---

## 📞 Support & Contact

- **Issues:** Create GitHub issue with detailed description
- **Questions:** Check [FAQ.md](./docs/FAQ.md)
- **Documentation:** See [INDEX.md](./INDEX.md) for full index
- **Contact:** [Your contact info or email]

---

## 📋 File Manifest

| File/Folder | Purpose | Lines |
|-------------|---------|-------|
| README.md | This guide | ~500 |
| PHASE_1_SPECIFICATION.md | Full specification | ~3500 |
| PROJECT_PLAN.md | Timeline and milestones | ~800 |
| PROJECT_SUMMARY.md | Quick reference | ~500 |
| docs/ARCHITECTURE.md | System design | ~700 |
| docs/API.md | API reference | ~1200 |
| docs/DATABASE_SCHEMA.md | Database design | ~1000 |
| docs/ER_DIAGRAM.md | Entity relationships | ~900 |
| docs/SETUP.md | Setup guide | ~800 |
| docs/DEPLOYMENT.md | Deployment guide | ~800 |

**Total Documentation:** 10,000+ lines (200+ pages)

---

## 📄 License

This project is part of a university assignment. All code and documentation are provided for educational purposes.

---

## 🎓 Project Credits

**Course:** Web Technology Project  
**Semester:** Fall 2025  
**Team:** [Your names here]  
**Last Updated:** December 6, 2025  
**Status:** Phase 1 ✅ COMPLETE | Phase 2 🔄 IN PROGRESS


