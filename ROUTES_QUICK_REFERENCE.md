 Express Routes - Quick Reference

Status:  COMPLETE  
Routes Files:  core route files  
Total Endpoints:  REST endpoints  
Authentication: JWT Bearer Token (h)

---

  Route Files Structure

```
backend/routes/
├── index.js               Route aggregator
├── auth.js                 authentication endpoints
├── eventGroups.js          event group endpoints
├── events.js               event & attendance endpoints (mixed auth)
└── attendance.js           attendance endpoints (mixed auth)
```

---

  Quick Endpoint Reference

 Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/register` |  | Register new user |
| POST | `/login` |  | Authenticate user, get token |
| POST | `/logout` |  | Logout (client-side discard) |
| POST | `/refresh` |  | Refresh JWT token |

---

 Event Groups Routes (`/api/event-groups`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` |  | List groups (paginated) |
| POST | `/` |  | Create new group |
| GET | `/:groupId` |  | Get group with events |
| PUT | `/:groupId` |  | Update group details |
| DELETE | `/:groupId` |  | Delete group (cascade) |

---

 Events Routes (`/api/events`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` |  | List events (paginated) |
| POST | `/` |  | Create new event |
| GET | `/:eventId` |  | Get event details |
| PUT | `/:eventId` |  | Update event info |
| DELETE | `/:eventId` |  | Delete event (draft only) |
| PATCH | `/:eventId/state` |  | Change state (OPEN/CLOSED) |
| POST | `/:eventId/attendance` |  | List attendees |
| GET | `/:eventId/attendance/stats` |  | Attendance statistics |
| GET | `/:eventId/attendance/export/csv` |  | Export CSV |
| GET | `/:eventId/attendance/export/xlsx` |  | Export XLSX |

---

 Attendance Routes (`/api/attendance`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/check-in/text` |  | Text code check-in |
| POST | `/check-in/qr` |  | QR code check-in |
| GET | `/events/:eventId` |  | List attendees |
| GET | `/events/:eventId/stats` |  | Get statistics |
| GET | `/events/:eventId/export/csv` |  | Export CSV |
| GET | `/events/:eventId/export/xlsx` |  | Export XLSX |

---

  Middleware Chain

All routes pass through this middleware chain:

```javascript
// server.js
app.use(express.json())           // Body parser
app.use(cors(corsOptions))        // CORS
app.use(requestLogger)            // Logging

// Protected routes
router.use(authMiddleware)        // JWT verification
```

Auth Middleware (`authMiddleware`):
- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies token signature and expiration
- Attaches user data to `req.user` object
- Returns  if token invalid/missing

---

  Route Integration in Server

```javascript
// backend/server.js

// . Middleware setup
app.use(express.json())
app.use(cors())
app.use(requestLogger)

// . Routes mounting
app.use('/api', apiRoutes)

// . Error handling (last middleware)
app.use(errorHandler)

// Where apiRoutes (routes/index.js) does:
const router = express.Router()
router.use('/auth', authRoutes)
router.use('/event-groups', eventGroupRoutes)
router.use('/events', eventRoutes)
router.use('/attendance', attendanceRoutes)
```

---

  Route Parameter Passing

 Example: Event Group with Sub-routes

```javascript
// routes/eventGroups.js
router.get('/:groupId', authMiddleware, controller.get)

// Can be called as:
// GET /api/event-groups/e-eb-d-a-

// req.params = { groupId: 'e-eb-d-a-' }
```

 Example: Nested Routes with mergeParams

```javascript
// routes/events.js with mergeParams: true
router.get('/:eventId/attendance', authMiddleware, controller.list)

// Can be called as:
// GET /api/events/event-uuid/attendance
// GET /api/event-groups/group-uuid/events/event-uuid/attendance
// (mergeParams allows access to parent params)
```

---

  HTTP Methods Used

| Method | Usage | Idempotent |
|--------|-------|-----------|
| GET | Retrieve data |  Yes |
| POST | Create resource |  No |
| PUT | Replace entire resource |  Yes |
| PATCH | Partial update |  Yes |
| DELETE | Remove resource |  Yes |

PATCH is idempotent for state changes (idempotent) but not for all operations.

---

  Access Control Summary

 Public Routes (No Auth Required)
- `POST /api/auth/register` - Anyone can register
- `POST /api/auth/login` - Anyone can login
- `POST /api/auth/logout` - Anyone can logout
- `POST /api/attendance/check-in/text` - Anyone can check-in
- `POST /api/attendance/check-in/qr` - Anyone can check-in

 Protected Routes (JWT Required)
All other routes require valid JWT token in `Authorization: Bearer <token>` header

 Ownership Verification
Event Organizers can only:
- Manage their own event groups
- Manage their own events
- View attendance for their events

Participants cannot:
- Create event groups
- Create/manage events
- View attendance lists

---

  Request/Response Format

 Request Headers (Protected Routes)
```
GET /api/event-groups HTTP/.
Host: localhost:
Authorization: Bearer eyJhbGciOiJIUzINiIsInRcCIIkpXVCJ...
Content-Type: application/json
```

 Request Body Example
```json
{
  "name": "Event Group Name",
  "email": "user@example.com",
  "code": "ABC"
}
```

 Response Format (All Endpoints)
```json
{
  "status": "success|error",
  "message": "Human-readable description",
  "data": {
    // Endpoint-specific payload
  },
  "pagination": {
    // Only for list endpoints
    "total": ,
    "page": ,
    "limit": ,
    "pages": 
  }
}
```

 Error Response Example
```json
{
  "status": "error",
  "message": "Event not found"
}
```

---

  Testing Routes

 Using cURL

```bash
 Register user
curl -X POST http://localhost:/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@ex.com","password":""}'

 Login
curl -X POST http://localhost:/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@ex.com","password":""}'

 Create event group (protected)
curl -X POST http://localhost:/api/event-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Conference "}'

 Check-in (public)
curl -X POST http://localhost:/api/attendance/check-in/text \
  -H "Content-Type: application/json" \
  -d '{"code":"ABC"}'
```

 Using Postman

. Create collection: "Attendance System"
. Set base URL: `http://localhost:/api`
. Create requests for each endpoint
. Use "Manage Environments" to store JWT token:
   - Variable: `token`
   - Value: JWT from register/login response
. Add Authorization header: `Bearer {{token}}`

 Using Thunder Client (VS Code)

. Install Thunder Client extension
. Create requests with same structure as Postman
. Can run tests in sequence

---

 ️ Configuration

 Environment Variables
```env
NODE_ENV=development
PORT=
API_PREFIX=/api
JWT_SECRET=your-secret-key-change-in-production
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=attendance_db
```

 CORS Configuration
Allows requests from configured origins (see `middleware/cors.js`)

 Database
- Driver: Sequelize ORM
- Database: PostgreSQL or MySQL
- Connection: Configured in `config/sequelize.js`

---

  Route Summary Statistics

| Category | Count |
|----------|-------|
| Total Endpoints |  |
| Public Endpoints |  |
| Protected Endpoints |  |
| GET Requests |  |
| POST Requests |  |
| PUT Requests |  |
| PATCH Requests |  |
| DELETE Requests |  |

---

  Related Documentation

- [Full API Documentation](./API_ROUTES.md) - Detailed endpoint specifications
- [Controllers Implementation](../CONTROLLERS_IMPLEMENTATION_COMPLETE.md) - Controller functions
- [Architecture Guide](./ARCHITECTURE.md) - System design
- [Database Schema](./DATABASE_SCHEMA.md) - Data models
- [Setup Guide](./SETUP.md) - Installation and configuration

---

  Checklist: Routes Implementation Complete

-  Authentication routes with JWT
-  Event groups CRUD
-  Events CRUD with state management
-  Public check-in endpoints
-  Attendance management and export
-  Middleware integration
-  Error handling
-  Request validation
-  Response formatting
-  Authorization checks
-  Comprehensive documentation

---

Routes Implementation:  COMPLETE

All Express routes are fully configured and ready for integration with controllers and frontend.

