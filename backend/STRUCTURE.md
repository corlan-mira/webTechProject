 Backend Folder Structure & Architecture

  Complete Folder Tree

```
backend/
│
├──  server.js                   Express app entry point
├──  package.json                NPM dependencies and scripts
├──  .env.example                Environment variables template
├──  README.md                   Backend setup guide
│
├──  config/
│   ├──  index.js                Configuration exports
│   ├──  database.js             PostgreSQL connection settings
│   ├──  environment.js          App environment variables
│   └──  sequelize.js            Sequelize ORM initialization
│
├──  models/
│   ├──  index.js                Model exports & associations
│   ├──  User.js                 Event Organizer model
│   ├──  EventGroup.js           Event Group model
│   ├──  Event.js                Event model
│   └──  Attendance.js           Attendance/Check-in model
│
├──  controllers/
│   ├──  index.js                Controller exports
│   ├──  authController.js       Auth endpoints (register, login)
│   ├──  eventGroupController.js Event group CRUD
│   ├──  eventController.js      Event CRUD & state mgmt
│   └──  attendanceController.js Check-in & attendance
│
├──  routes/
│   ├──  index.js                Route aggregator
│   ├──  auth.js                 /api/auth/
│   ├──  eventGroups.js          /api/event-groups/
│   ├──  events.js               /api/events/ & check-in
│   └──  attendance.js           /api/attendance/
│
├──  services/
│   ├──  index.js                Service exports
│   ├──  authService.js          Authentication business logic
│   ├──  eventGroupService.js    Event group operations
│   ├──  eventService.js         Event operations
│   ├──  attendanceService.js    Check-in operations
│   ├──  qrCodeService.js        QR code generation (QRServer)
│   └──  exportService.js        CSV/XLSX export
│
├──  middleware/
│   ├──  index.js                Middleware exports
│   ├──  authMiddleware.js       JWT verification
│   ├──  errorHandler.js         Error handling
│   ├──  validation.js           Request validation
│   ├──  cors.js                 CORS configuration
│   └──  logging.js              HTTP request logging
│
├──  utils/
│   ├──  index.js                Utility exports
│   ├──  validators.js           Input validation functions
│   ├──  formatters.js           Data formatting functions
│   ├──  generators.js           Generate codes, hashes, UUIDs
│   ├──  errorHandler.js         Custom error classes
│   └──  constants.js            App constants (enums, limits)
│
├──  jobs/
│   ├──  index.js                Background job exports
│   ├──  cleanupJob.js           Database cleanup job
│   └──  syncJob.js              Data sync job
│
├──  migrations/
│   ├──  README.md               Migration instructions
│   └── (Migration files)          [timestamp]-action.js files
│
└──  seeders/
    ├──  README.md               Seeder instructions
    └── (Seeder files)             [timestamp]-name.js files
```

---

  File Descriptions by Folder

  config/ - Configuration
Centralized configuration management for the application.

| File | Purpose |
|------|---------|
| `index.js` | Exports all config modules |
| `database.js` | PostgreSQL connection settings (dev/test/prod) |
| `environment.js` | Environment variables and defaults |
| `sequelize.js` | Sequelize ORM instance initialization |

Usage:
```javascript
const { database, environment, sequelize } = require('./config');
```

---

  models/ - Sequelize Models
ORM models representing database entities.

| File | Purpose |
|------|---------|
| `index.js` | Initializes models & defines associations |
| `User.js` | Event Organizer (id, email, password_hash, name) |
| `EventGroup.js` | Event collection (user_id, name, description) |
| `Event.js` | Individual event (group_id, name, state, access_code, qr_code_url) |
| `Attendance.js` | Check-in record (event_id, participant_name, check_in_method) |

Associations:
```
User :N EventGroup
EventGroup :N Event
Event :N Attendance
```

---

  controllers/ - Request Handlers
Process HTTP requests and delegate to services.

| File | Purpose | Methods |
|------|---------|---------|
| `index.js` | Exports all controllers | - |
| `authController.js` | User authentication | register, login, logout, refreshToken |
| `eventGroupController.js` | Group management | list, create, get, update, delete |
| `eventController.js` | Event management | list, create, get, update, delete, changeState |
| `attendanceController.js` | Check-ins | checkInByText, checkInByQR, list, exportCSV, exportXLSX, getStats |

Pattern:
```javascript
// Controller receives request, validates, calls service, returns response
exports.create = async (req, res) => {
  try {
    const result = await service.create(req.body);
    res.status().json(result);
  } catch (error) {
    res.status().json({ error: error.message });
  }
};
```

---

 ️ routes/ - API Routes
Define endpoints and map to controllers.

| File | Endpoints | Methods |
|------|-----------|---------|
| `index.js` | Route aggregator | Mounts all sub-routes |
| `auth.js` | /api/auth/ | POST register, login, logout, refresh-token |
| `eventGroups.js` | /api/event-groups/ | GET, POST, PUT, DELETE |
| `events.js` | /api/events/ | GET, POST, PUT, DELETE, PATCH, check-in, export |
| `attendance.js` | /api/attendance/ | Check-in & export endpoints |

---

  services/ - Business Logic
Encapsulate business logic and database operations.

| File | Purpose | Functions |
|------|---------|-----------|
| `index.js` | Service exports | - |
| `authService.js` | Authentication logic | registerUser, authenticateUser, generateToken, verifyToken |
| `eventGroupService.js` | Group operations | create, list, get, update, delete |
| `eventService.js` | Event operations | create, list, get, update, delete, changeState, generateAccessCode |
| `attendanceService.js` | Check-in logic | checkInByAccessCode, checkInByQR, list, verify, getStats |
| `qrCodeService.js` | QR generation | generateQRCode (via QRServer API), validate, extract |
| `exportService.js` | Data export | exportToCSV, exportToXLSX, format |

Layer Pattern:
```
Controller → Service → Models → Database
```

---

 ️ middleware/ - Express Middleware
Intercept and process requests/responses.

| File | Purpose |
|------|---------|
| `index.js` | Middleware exports |
| `authMiddleware.js` | JWT verification, ownership checks |
| `errorHandler.js` | Centralized error handling |
| `validation.js` | Request body validation |
| `cors.js` | Cross-origin resource sharing |
| `logging.js` | HTTP request logging |

Execution Order:
```
Request → Logging → CORS → Body Parser → Auth → Validation → Controller → Error Handler → Response
```

---

 ️ utils/ - Utility Functions
Helper functions and reusable code.

| File | Purpose |
|------|---------|
| `index.js` | Utility exports |
| `validators.js` | Input validation (email, password, UUID, dates) |
| `formatters.js` | Format responses, dates, records |
| `generators.js` | Generate access codes, UUIDs, hashes |
| `errorHandler.js` | Custom error classes (AppError, ValidationError, etc.) |
| `constants.js` | Enums & limits (EVENT_STATE, CHECK_IN_METHOD, etc.) |

---

  jobs/ - Background Jobs
Scheduled tasks and background processing.

| File | Purpose | Schedule |
|------|---------|----------|
| `index.js` | Job exports | - |
| `cleanupJob.js` | Clean expired sessions, archive old events | Daily  AM |
| `syncJob.js` | Sync statistics, update status | Every  hours |

---

  migrations/ - Database Migrations
Version control for database schema changes.

Structure:
```javascript
// [timestamp]-action.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Forward migration (apply changes)
  },
  down: async (queryInterface, Sequelize) => {
    // Rollback (undo changes)
  }
};
```

First Migration: Initialize  tables (users, event_groups, events, attendance)

---

  seeders/ - Database Seeders
Populate development/test database with sample data.

Structure:
```javascript
// [timestamp]-demo-data.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert demo data
  },
  down: async (queryInterface, Sequelize) => {
    // Remove demo data
  }
};
```

Sample Data: Demo users, groups, events, attendance records

---

  Initialization Flow

```
. server.js
   ├─ Load environment (config/environment.js)
   ├─ Initialize Sequelize (config/sequelize.js)
   ├─ Create Express app
   ├─ Apply middleware (cors, logging, auth, validation)
   ├─ Mount routes (routes/index.js)
   │  └─ Sub-routes: auth, eventGroups, events, attendance
   ├─ Error handler (middleware/errorHandler.js)
   ├─ Connect to PostgreSQL
   ├─ Sync models (or run migrations in production)
   └─ Listen on PORT
```

---

  Typical Request Flow

```
HTTP Request
    ↓
[Logging Middleware] → Log request
    ↓
[CORS Middleware] → Check origin
    ↓
[Auth Middleware] → Verify JWT (if protected)
    ↓
[Validation Middleware] → Validate request body
    ↓
[Controller] → Parse request
    ↓
[Service] → Business logic & database
    ↓
[Models/Sequelize] → Query database
    ↓
[Response] → Format & send back
    ↓
[Error Handler] → Handle any errors
```

---

  Dependencies

Production:
- `express` - Web framework
- `sequelize` - ORM
- `pg` & `pg-hstore` - PostgreSQL driver
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `cors` - CORS handling
- `dotenv` - Environment variables

Development:
- `nodemon` - Auto-reload
- `eslint` - Code linting
- `prettier` - Code formatting
- `jest` - Testing
- `supertest` - API testing

---

  Module Exports

Each folder has an `index.js` that exports its modules:

```javascript
// config/index.js
module.exports = {
  database: require('./database'),
  environment: require('./environment'),
  sequelize: require('./sequelize'),
};

// Usage
const { database, environment, sequelize } = require('./config');
```

---

  File Checklist

- [x] config/ -  files (database, environment, sequelize, index)
- [x] models/ -  files (User, EventGroup, Event, Attendance, index)
- [x] controllers/ -  files (auth, eventGroup, event, attendance, index)
- [x] routes/ -  files (auth, eventGroups, events, attendance, index)
- [x] services/ -  files (auth, eventGroup, event, attendance, qrCode, export, index)
- [x] middleware/ -  files (auth, errorHandler, validation, cors, logging, index)
- [x] utils/ -  files (validators, formatters, generators, errorHandler, constants, index)
- [x] jobs/ -  files (cleanupJob, syncJob, index)
- [x] migrations/ - README + migration template
- [x] seeders/ - README + seeder template
- [x] Root files - server.js, package.json, README.md, .env.example

Total:  files + directories

---

  Next Steps

. Install dependencies:
   ```bash
   npm install
   ```

. Configure environment:
   ```bash
   cp .env.example .env
    Edit .env with PostgreSQL credentials
   ```

. Run migrations:
   ```bash
   npm run migrate
   ```

. Seed demo data (optional):
   ```bash
   npm run seed:all
   ```

. Start development server:
   ```bash
   npm run dev
   ```

---

  Documentation

- API: See [../docs/API.md](../docs/API.md)
- Database: See [../docs/DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md)
- Architecture: See [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- Setup: See [../docs/SETUP.md](../docs/SETUP.md)

---

Status:  Phase  Complete  
Last Updated: December ,   
Backend Structure: PostgreSQL + Sequelize + Express
