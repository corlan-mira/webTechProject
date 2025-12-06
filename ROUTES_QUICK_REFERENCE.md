# Express Routes - Quick Reference

**Status:** ✅ COMPLETE  
**Routes Files:** 4 core route files  
**Total Endpoints:** 21 REST endpoints  
**Authentication:** JWT Bearer Token (24h)

---

## 📂 Route Files Structure

```
backend/routes/
├── index.js              # Route aggregator
├── auth.js               # 4 authentication endpoints
├── eventGroups.js        # 5 event group endpoints
├── events.js             # 11 event & attendance endpoints (mixed auth)
└── attendance.js         # 6 attendance endpoints (mixed auth)
```

---

## 🚀 Quick Endpoint Reference

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Authenticate user, get token |
| POST | `/logout` | ❌ | Logout (client-side discard) |
| POST | `/refresh` | ✅ | Refresh JWT token |

---

### Event Groups Routes (`/api/event-groups`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | ✅ | List groups (paginated) |
| POST | `/` | ✅ | Create new group |
| GET | `/:groupId` | ✅ | Get group with events |
| PUT | `/:groupId` | ✅ | Update group details |
| DELETE | `/:groupId` | ✅ | Delete group (cascade) |

---

### Events Routes (`/api/events`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | ✅ | List events (paginated) |
| POST | `/` | ✅ | Create new event |
| GET | `/:eventId` | ✅ | Get event details |
| PUT | `/:eventId` | ✅ | Update event info |
| DELETE | `/:eventId` | ✅ | Delete event (draft only) |
| PATCH | `/:eventId/state` | ✅ | Change state (OPEN/CLOSED) |
| POST | `/:eventId/attendance` | ✅ | List attendees |
| GET | `/:eventId/attendance/stats` | ✅ | Attendance statistics |
| GET | `/:eventId/attendance/export/csv` | ✅ | Export CSV |
| GET | `/:eventId/attendance/export/xlsx` | ✅ | Export XLSX |

---

### Attendance Routes (`/api/attendance`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/check-in/text` | ❌ | Text code check-in |
| POST | `/check-in/qr` | ❌ | QR code check-in |
| GET | `/events/:eventId` | ✅ | List attendees |
| GET | `/events/:eventId/stats` | ✅ | Get statistics |
| GET | `/events/:eventId/export/csv` | ✅ | Export CSV |
| GET | `/events/:eventId/export/xlsx` | ✅ | Export XLSX |

---

## 🔐 Middleware Chain

All routes pass through this middleware chain:

```javascript
// server.js
app.use(express.json())           // Body parser
app.use(cors(corsOptions))        // CORS
app.use(requestLogger)            // Logging

// Protected routes
router.use(authMiddleware)        // JWT verification
```

**Auth Middleware (`authMiddleware`):**
- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies token signature and expiration
- Attaches user data to `req.user` object
- Returns 401 if token invalid/missing

---

## 📋 Route Integration in Server

```javascript
// backend/server.js

// 1. Middleware setup
app.use(express.json())
app.use(cors())
app.use(requestLogger)

// 2. Routes mounting
app.use('/api', apiRoutes)

// 3. Error handling (last middleware)
app.use(errorHandler)

// Where apiRoutes (routes/index.js) does:
const router = express.Router()
router.use('/auth', authRoutes)
router.use('/event-groups', eventGroupRoutes)
router.use('/events', eventRoutes)
router.use('/attendance', attendanceRoutes)
```

---

## 🔄 Route Parameter Passing

### Example: Event Group with Sub-routes

```javascript
// routes/eventGroups.js
router.get('/:groupId', authMiddleware, controller.get)

// Can be called as:
// GET /api/event-groups/550e8400-e29b-41d4-a716-446655440000

// req.params = { groupId: '550e8400-e29b-41d4-a716-446655440000' }
```

### Example: Nested Routes with mergeParams

```javascript
// routes/events.js with mergeParams: true
router.get('/:eventId/attendance', authMiddleware, controller.list)

// Can be called as:
// GET /api/events/event-uuid/attendance
// GET /api/event-groups/group-uuid/events/event-uuid/attendance
// (mergeParams allows access to parent params)
```

---

## 📡 HTTP Methods Used

| Method | Usage | Idempotent |
|--------|-------|-----------|
| GET | Retrieve data | ✅ Yes |
| POST | Create resource | ❌ No |
| PUT | Replace entire resource | ✅ Yes |
| PATCH | Partial update | ✅ Yes* |
| DELETE | Remove resource | ✅ Yes |

*PATCH is idempotent for state changes (idempotent) but not for all operations.

---

## 🎯 Access Control Summary

### Public Routes (No Auth Required)
- `POST /api/auth/register` - Anyone can register
- `POST /api/auth/login` - Anyone can login
- `POST /api/auth/logout` - Anyone can logout
- `POST /api/attendance/check-in/text` - Anyone can check-in
- `POST /api/attendance/check-in/qr` - Anyone can check-in

### Protected Routes (JWT Required)
All other routes require valid JWT token in `Authorization: Bearer <token>` header

### Ownership Verification
Event Organizers can only:
- Manage their own event groups
- Manage their own events
- View attendance for their events

Participants cannot:
- Create event groups
- Create/manage events
- View attendance lists

---

## 💾 Request/Response Format

### Request Headers (Protected Routes)
```
GET /api/event-groups HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Request Body Example
```json
{
  "name": "Event Group Name",
  "email": "user@example.com",
  "code": "ABC123"
}
```

### Response Format (All Endpoints)
```json
{
  "status": "success|error",
  "message": "Human-readable description",
  "data": {
    // Endpoint-specific payload
  },
  "pagination": {
    // Only for list endpoints
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Error Response Example
```json
{
  "status": "error",
  "message": "Event not found"
}
```

---

## 🧪 Testing Routes

### Using cURL

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@ex.com","password":"12345678"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@ex.com","password":"12345678"}'

# Create event group (protected)
curl -X POST http://localhost:3000/api/event-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Conference 2025"}'

# Check-in (public)
curl -X POST http://localhost:3000/api/attendance/check-in/text \
  -H "Content-Type: application/json" \
  -d '{"code":"ABC123"}'
```

### Using Postman

1. Create collection: "Attendance System"
2. Set base URL: `http://localhost:3000/api`
3. Create requests for each endpoint
4. Use "Manage Environments" to store JWT token:
   - Variable: `token`
   - Value: JWT from register/login response
5. Add Authorization header: `Bearer {{token}}`

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create requests with same structure as Postman
3. Can run tests in sequence

---

## ⚙️ Configuration

### Environment Variables
```env
NODE_ENV=development
PORT=3000
API_PREFIX=/api
JWT_SECRET=your-secret-key-change-in-production
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=attendance_db
```

### CORS Configuration
Allows requests from configured origins (see `middleware/cors.js`)

### Database
- Driver: Sequelize ORM
- Database: PostgreSQL or MySQL
- Connection: Configured in `config/sequelize.js`

---

## 📝 Route Summary Statistics

| Category | Count |
|----------|-------|
| Total Endpoints | 21 |
| Public Endpoints | 5 |
| Protected Endpoints | 16 |
| GET Requests | 10 |
| POST Requests | 7 |
| PUT Requests | 2 |
| PATCH Requests | 1 |
| DELETE Requests | 1 |

---

## 🔗 Related Documentation

- **[Full API Documentation](./API_ROUTES.md)** - Detailed endpoint specifications
- **[Controllers Implementation](../CONTROLLERS_IMPLEMENTATION_COMPLETE.md)** - Controller functions
- **[Architecture Guide](./ARCHITECTURE.md)** - System design
- **[Database Schema](./DATABASE_SCHEMA.md)** - Data models
- **[Setup Guide](./SETUP.md)** - Installation and configuration

---

## ✅ Checklist: Routes Implementation Complete

- ✅ Authentication routes with JWT
- ✅ Event groups CRUD
- ✅ Events CRUD with state management
- ✅ Public check-in endpoints
- ✅ Attendance management and export
- ✅ Middleware integration
- ✅ Error handling
- ✅ Request validation
- ✅ Response formatting
- ✅ Authorization checks
- ✅ Comprehensive documentation

---

**Routes Implementation:** ✅ COMPLETE

All Express routes are fully configured and ready for integration with controllers and frontend.

