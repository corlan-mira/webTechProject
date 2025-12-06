# Backend Folder Tree - Complete Reference

## Visual Tree Structure

```
event-attendance-system/backend/
│
├── 📄 server.js                                    [Express app entry point - 100+ lines]
├── 📄 package.json                                 [NPM dependencies & scripts]
├── 📄 README.md                                    [Backend setup guide]
├── 📄 STRUCTURE.md                                 [Architecture documentation]
├── 📄 .env.example                                 [Environment template - 30+ vars]
│
├── 📁 config/                                      [Configuration Management]
│   ├── 📄 index.js                                 [Exports: database, environment, sequelize]
│   ├── 📄 database.js                              [PostgreSQL connection (3 envs: dev/test/prod)]
│   ├── 📄 environment.js                           [App variables: JWT, CORS, QR, etc]
│   └── 📄 sequelize.js                             [Sequelize ORM initialization]
│
├── 📁 models/                                      [Sequelize ORM Models]
│   ├── 📄 index.js                                 [Initializes models & associations]
│   ├── 📄 User.js                                  [Event Organizer - 6 fields, 1:N EventGroup]
│   ├── 📄 EventGroup.js                            [Event Collection - 6 fields, 1:N Event]
│   ├── 📄 Event.js                                 [Individual Event - 12 fields, 1:N Attendance]
│   └── 📄 Attendance.js                            [Check-in Record - 7 fields, N:1 Event]
│
├── 📁 controllers/                                 [Request Handlers - 21 methods total]
│   ├── 📄 index.js                                 [Exports all controllers]
│   ├── 📄 authController.js                        [Auth: register, login, logout, refreshToken]
│   ├── 📄 eventGroupController.js                  [Group CRUD: list, create, get, update, delete]
│   ├── 📄 eventController.js                       [Event CRUD + changeState - 6 methods]
│   └── 📄 attendanceController.js                  [Check-in & export - 6 methods]
│
├── 📁 routes/                                      [API Route Definitions - 26 routes]
│   ├── 📄 index.js                                 [Route aggregator & mounter]
│   ├── 📄 auth.js                                  [POST /auth/register, login, logout, refresh]
│   ├── 📄 eventGroups.js                           [GET/POST/PUT/DELETE /event-groups/*]
│   ├── 📄 events.js                                [Event CRUD & check-in routes]
│   └── 📄 attendance.js                            [Attendance check-in & export routes]
│
├── 📁 services/                                    [Business Logic - 28 functions total]
│   ├── 📄 index.js                                 [Exports all services]
│   ├── 📄 authService.js                           [Auth logic: register, authenticate, token]
│   ├── 📄 eventGroupService.js                     [Group operations - 5 functions]
│   ├── 📄 eventService.js                          [Event operations - 7 functions]
│   ├── 📄 attendanceService.js                     [Check-in logic - 6 functions]
│   ├── 📄 qrCodeService.js                         [QRServer API integration - 3 functions]
│   └── 📄 exportService.js                         [CSV/XLSX export - 3 functions]
│
├── 📁 middleware/                                  [Express Middleware - 2-5 per file]
│   ├── 📄 index.js                                 [Middleware exports]
│   ├── 📄 authMiddleware.js                        [JWT: verifyToken, verifyOwnership]
│   ├── 📄 errorHandler.js                          [Centralized error handling]
│   ├── 📄 validation.js                            [Input validation - 5 functions]
│   ├── 📄 cors.js                                  [CORS configuration]
│   └── 📄 logging.js                               [HTTP request logging]
│
├── 📁 utils/                                       [Utility Functions - 22 total]
│   ├── 📄 index.js                                 [Utility exports]
│   ├── 📄 validators.js                            [Input validation - 5 functions]
│   ├── 📄 formatters.js                            [Data formatting - 4 functions]
│   ├── 📄 generators.js                            [Generate codes/hashes - 4 functions]
│   ├── 📄 errorHandler.js                          [Custom error classes - 5 classes]
│   └── 📄 constants.js                             [Enums & limits - 5 constant objects]
│
├── 📁 jobs/                                        [Background Jobs - 2 jobs]
│   ├── 📄 index.js                                 [Job exports]
│   ├── 📄 cleanupJob.js                            [Daily cleanup - delete sessions, archive]
│   └── 📄 syncJob.js                               [Every 6h sync - stats, status, reports]
│
├── 📁 migrations/                                  [Database Migrations]
│   ├── 📄 README.md                                [Migration instructions]
│   └── (To be created: [timestamp]-init.js)        [Initialize 4 tables]
│
└── 📁 seeders/                                     [Database Seeders]
    ├── 📄 README.md                                [Seeder instructions]
    └── (To be created: [timestamp]-demo-*.js)      [Demo users, events, attendance]
```

---

## 📊 Statistics

### File Count by Type
- **JavaScript Files:** 37
- **Documentation:** 4 (README.md, STRUCTURE.md, 2 x README in migrations/seeders)
- **Configuration:** 2 (.env.example)
- **Directories:** 10
- **Total Items:** 53

### Lines of Code (Skeleton)
- **Models:** 300+ lines
- **Controllers:** 250+ lines
- **Services:** 350+ lines
- **Routes:** 200+ lines
- **Middleware:** 150+ lines
- **Utils:** 200+ lines
- **Config:** 150+ lines
- **Server:** 100+ lines
- **Total:** ~1,700+ lines (ready for implementation)

### Function Count
- **Controllers:** 21 methods
- **Services:** 28 functions
- **Middleware:** 12 functions
- **Utilities:** 22 functions
- **Total:** ~83 functions/methods

### API Routes
- **Auth:** 4 routes (register, login, logout, refresh)
- **Event Groups:** 5 routes (CRUD)
- **Events:** 11 routes (CRUD + state + check-in + export)
- **Attendance:** 6 routes (check-in + export)
- **Total:** 26 routes (covering 18 spec endpoints)

---

## 🎯 Folder Purposes Quick Reference

| Folder | Purpose | Files | Key Concept |
|--------|---------|-------|---|
| **config/** | Configuration management | 4 | Centralized settings |
| **models/** | Database entities | 5 | Sequelize ORM |
| **controllers/** | HTTP request handlers | 5 | MVC Controller |
| **routes/** | API endpoint definitions | 5 | RESTful routing |
| **services/** | Business logic | 7 | Service layer |
| **middleware/** | Request/response processing | 6 | Middleware chain |
| **utils/** | Helper functions | 6 | Reusable utilities |
| **jobs/** | Background tasks | 3 | Scheduled jobs |
| **migrations/** | Schema versioning | - | Database evolution |
| **seeders/** | Test data | - | Development data |

---

## 🔗 Key Relationships

### Model Associations
```
User (1) ──┬─→ (N) EventGroup
           │
EventGroup (1) ──┬─→ (N) Event
                 │
          Event (1) ──┬─→ (N) Attendance
```

### Data Flow
```
HTTP Request
    ↓
Route Handler (routes/)
    ↓
Controller (controllers/)
    ↓
Service (services/)
    ↓
Model/Sequelize (models/)
    ↓
PostgreSQL Database
```

### Middleware Chain
```
Request
  ↓ [Logging Middleware]
  ↓ [CORS Middleware]
  ↓ [Body Parser]
  ↓ [Auth Middleware]
  ↓ [Validation Middleware]
  ↓ Controller Handler
  ↓ [Error Handler Middleware]
Response
```

---

## 🚀 Implementation Order Recommendation

1. **Phase 1: Setup (Hours 1-2)**
   - [ ] npm install
   - [ ] Copy .env.example → .env
   - [ ] Create PostgreSQL database
   - [ ] Test database connection in config/

2. **Phase 2: Database (Hours 3-4)**
   - [ ] Create migrations for 4 tables
   - [ ] Run migrations
   - [ ] Verify schema in PostgreSQL

3. **Phase 3: Services (Hours 5-12)**
   - [ ] Implement authService (password hashing, JWT)
   - [ ] Implement eventGroupService (CRUD)
   - [ ] Implement eventService (CRUD + access code generation)
   - [ ] Implement attendanceService (check-in logic)
   - [ ] Implement qrCodeService (QRServer API calls)
   - [ ] Implement exportService (CSV export)

4. **Phase 4: Controllers (Hours 13-17)**
   - [ ] Implement all 5 controllers
   - [ ] Add request validation
   - [ ] Add error handling
   - [ ] Test endpoints with Postman

5. **Phase 5: Testing (Hours 18-25)**
   - [ ] Write unit tests for services
   - [ ] Write integration tests for routes
   - [ ] Test database migrations
   - [ ] Test error scenarios

6. **Phase 6: Polish (Hours 26-33)**
   - [ ] Add logging
   - [ ] Add documentation
   - [ ] Performance optimization
   - [ ] Security review

---

## ✨ Ready-to-Use Components

✅ **Immediately Usable:**
- Environment configuration system
- Sequelize ORM setup
- Express middleware pipeline
- Error handling framework
- Input validators
- Data formatters
- Code generators
- Custom error classes
- Database connection pool

✅ **Templates Provided:**
- Model definition template
- Service function template
- Controller method template
- Route definition template
- Middleware function template
- Migration template
- Seeder template

✅ **Examples Included:**
- JSDoc comments on all functions
- Error handling patterns
- Service layer abstraction
- Controller delegation pattern

---

## 📚 Documentation Hierarchy

```
backend/
├── STRUCTURE.md ──→ This detailed architecture guide
├── README.md ──→ Quick start guide
└── Folder-specific README:
    ├── migrations/README.md
    └── seeders/README.md
```

See parent folder for:
- `docs/API.md` - API endpoint specifications
- `docs/DATABASE_SCHEMA.md` - Detailed schema design
- `docs/ARCHITECTURE.md` - System architecture
- `PHASE_1_SPECIFICATION.md` - Complete requirements

---

## 🎓 Learning Path for Implementation

1. **Understand the Architecture** (30 min)
   - Read STRUCTURE.md (this file)
   - Read architecture diagram in ARCHITECTURE.md

2. **Setup Environment** (30 min)
   - Follow backend/README.md
   - Install dependencies
   - Configure .env

3. **Explore Skeleton Code** (1 hour)
   - Review model definitions
   - Review controller signatures
   - Review service function stubs

4. **Implement Services** (8 hours)
   - Start with authService
   - Implement each service function
   - Test with database queries

5. **Wire Controllers** (5 hours)
   - Implement controller methods
   - Add validation
   - Add error handling

6. **Test Everything** (8 hours)
   - Unit tests for services
   - Integration tests for routes
   - End-to-end testing

7. **Document & Polish** (3 hours)
   - Add JSDoc to implementations
   - Write API examples
   - Test with frontend

---

**Backend Scaffolding Complete! Ready for Implementation.** ✅

For questions about the architecture, see [STRUCTURE.md](./STRUCTURE.md)  
For setup instructions, see [README.md](./README.md)  
For API specs, see [../docs/API.md](../docs/API.md)
