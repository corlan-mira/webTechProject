# Quick Reference: Models and Migrations

## File Structure

```
backend/
├── models/
│   ├── User.js              ✅ Organizers & Participants
│   ├── EventGroup.js        ✅ Event Collections
│   ├── Event.js             ✅ Individual Events
│   ├── Attendance.js        ✅ Check-in Records
│   └── index.js             ✅ Model Initialization & Associations
│
└── migrations/
    ├── 001-create-users.js
    ├── 002-create-event-groups.js
    ├── 003-create-events.js
    └── 004-create-attendance.js
```

---

## Model Summary

### User Model
```javascript
// Create
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password_hash: 'hashed_password',
  role: 'EO'  // or 'PARTICIPANT'
});

// Find
const user = await User.findOne({ where: { email: 'john@example.com' } });
const user = await User.findByPk(userId);

// Update
await user.update({ name: 'Jane Doe' });

// Associations
const eventGroups = await user.getEvent_groups();
const attendances = await user.getAttendances();
```

**Roles:**
- `EO` - Event Organizer (creates events)
- `PARTICIPANT` - Regular participant (checks in)

---

### EventGroup Model
```javascript
// Create
const group = await EventGroup.create({
  name: 'Fall 2025 Training',
  description: 'Training sessions...',
  created_by: userId
});

// Find
const group = await EventGroup.findByPk(groupId, {
  include: [{ association: 'events' }]
});

// Find User's Groups
const groups = await EventGroup.findAll({
  where: { created_by: userId }
});

// Associations
const creator = await group.getCreator();
const events = await group.getEvents();
```

---

### Event Model
```javascript
// Create
const event = await Event.create({
  group_id: groupId,
  title: 'NodeJS Workshop',
  start_time: new Date('2025-12-10 09:00:00'),
  duration_minutes: 120,
  code_text: 'NODE2025',
  state: 'OPEN',  // or 'CLOSED'
  created_by: userId
});

// Find by Code (used for check-in)
const event = await Event.findOne({
  where: { code_text: 'NODE2025' }
});

// Find by ID
const event = await Event.findByPk(eventId, {
  include: [
    { association: 'group' },
    { association: 'creator' },
    { association: 'attendances' }
  ]
});

// Change State
await event.update({ state: 'CLOSED' });

// Get Check-ins
const attendees = await event.getAttendances({
  include: [{ association: 'participant' }]
});
```

**States:**
- `OPEN` - Accepting check-ins
- `CLOSED` - No longer accepting check-ins

---

### Attendance Model
```javascript
// Create Check-in
const checkin = await Attendance.create({
  event_id: eventId,
  participant_id: userId,  // null for anonymous
  timestamp: new Date()
});

// Get All Check-ins for Event
const checkIns = await Attendance.findAll({
  where: { event_id: eventId },
  include: [{ association: 'participant', attributes: ['name', 'email'] }],
  order: [['timestamp', 'ASC']]
});

// Get Participant's Check-ins
const participantCheckIns = await Attendance.findAll({
  where: { participant_id: userId },
  include: [{ association: 'event' }]
});

// Check if Already Checked In
const existing = await Attendance.findOne({
  where: {
    event_id: eventId,
    participant_id: userId
  }
});
```

---

## Migration Commands

```bash
# Run all pending migrations
npm run migrate

# OR use Sequelize CLI directly
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Check status
npx sequelize-cli db:migrate:status
```

---

## Relationships Overview

### One-to-Many (1:N)

```
User (1) ──hasMany──> EventGroup (N)
  └─ One organizer creates many event groups

User (1) ──hasMany──> Event (N)
  └─ One organizer creates many events

User (1) ──hasMany──> Attendance (N)
  └─ One participant checks in many times

EventGroup (1) ──hasMany──> Event (N)
  └─ One group contains many events

Event (1) ──hasMany──> Attendance (N)
  └─ One event has many check-ins
```

### Many-to-One (N:1)

```
EventGroup (N) ──belongsTo──> User (1)
  └─ Group belongs to organizer

Event (N) ──belongsTo──> EventGroup (1)
  └─ Event belongs to group

Event (N) ──belongsTo──> User (1)
  └─ Event created by organizer

Attendance (N) ──belongsTo──> Event (1)
  └─ Check-in belongs to event

Attendance (N) ──belongsTo──> User (1)
  └─ Check-in by participant (optional)
```

---

## Loading Related Data

### Eager Loading (Include)

```javascript
// Get event with group and creator
const event = await Event.findByPk(eventId, {
  include: [
    { association: 'group' },
    { association: 'creator', attributes: ['id', 'name', 'email'] }
  ]
});

// Get user with all event groups
const user = await User.findByPk(userId, {
  include: {
    association: 'event_groups',
    include: { association: 'events' }
  }
});

// Get event with attendances and participant info
const event = await Event.findByPk(eventId, {
  include: {
    association: 'attendances',
    include: {
      association: 'participant',
      attributes: ['id', 'name', 'email']
    }
  }
});
```

### Lazy Loading (Get Methods)

```javascript
const group = await EventGroup.findByPk(groupId);
const creator = await group.getCreator();
const events = await group.getEvents();
```

---

## Common Queries

### Get Organizer Dashboard
```javascript
const organizer = await User.findByPk(userId, {
  where: { role: 'EO' },
  include: [
    {
      association: 'event_groups',
      include: [
        {
          association: 'events',
          attributes: ['id', 'title', 'start_time', 'state']
        }
      ]
    }
  ]
});
```

### Get Event with Statistics
```javascript
const event = await Event.findByPk(eventId, {
  include: [
    { association: 'group' },
    {
      association: 'attendances',
      attributes: ['id', 'timestamp', 'participant_id'],
      include: {
        association: 'participant',
        attributes: ['name', 'email']
      }
    }
  ]
});

const stats = {
  totalCheckIns: event.attendances.length,
  uniqueParticipants: new Set(
    event.attendances
      .filter(a => a.participant_id)
      .map(a => a.participant_id)
  ).size
};
```

### Get User's Recent Check-ins
```javascript
const recentCheckIns = await Attendance.findAll({
  where: { participant_id: userId },
  include: {
    association: 'event',
    attributes: ['id', 'title', 'start_time']
  },
  order: [['timestamp', 'DESC']],
  limit: 10
});
```

### Find Open Events for Check-in
```javascript
const openEvents = await Event.findAll({
  where: { state: 'OPEN' },
  attributes: ['id', 'title', 'code_text'],
  order: [['start_time', 'ASC']]
});
```

---

## Data Types Reference

### PostgreSQL Types Used

| Type | Description | Used In |
|------|-------------|---------|
| `UUID` | Universally unique identifier | All primary keys |
| `VARCHAR(N)` | Variable-length string | name, email, title, code_text |
| `TEXT` | Long text | description, code_qr |
| `TIMESTAMP` | Date and time | start_time, created_at, timestamp |
| `INTEGER` | Whole number | duration_minutes |
| `ENUM` | Fixed set of values | role, state |

### Sequelize DataTypes

```javascript
const { DataTypes } = require('sequelize');

DataTypes.UUID            // UUID v4
DataTypes.UUIDV4          // UUID version 4
DataTypes.STRING(255)     // VARCHAR(255)
DataTypes.TEXT            // TEXT
DataTypes.DATE            // TIMESTAMP
DataTypes.INTEGER         // INTEGER
DataTypes.ENUM('A', 'B')  // ENUM type
```

---

## Indexes Overview

### Primary Keys (Auto-indexed)
```
users.id
event_groups.id
events.id
attendance.id
```

### Unique Indexes
```
users.email             -- UNIQUE (login lookup)
events.code_text        -- UNIQUE (access code lookup)
```

### Foreign Key Indexes
```
event_groups.created_by
events.group_id
events.created_by
attendance.event_id
attendance.participant_id
```

### Performance Indexes
```
users.role
users.created_at

events.state
events.start_time
events.created_at

attendance.timestamp
attendance.created_at
attendance.(event_id, participant_id) -- Composite
```

---

## Cascading Delete Behavior

### Delete User (EO)
```
User → EventGroups deleted (CASCADE)
     → Events deleted (CASCADE)
        → Attendance deleted (CASCADE)
```

### Delete User (PARTICIPANT)
```
User → Attendance.participant_id = NULL (SET NULL)
       Records preserved for history
```

### Delete EventGroup
```
EventGroup → Events deleted (CASCADE)
           → Attendance deleted (CASCADE)
```

### Delete Event
```
Event → Attendance deleted (CASCADE)
```

---

## Validation Rules

### User Model
- `name`: Required, max 255 chars
- `email`: Required, unique, valid email format
- `password_hash`: Required, max 255 chars
- `role`: Required, must be 'EO' or 'PARTICIPANT'

### EventGroup Model
- `name`: Required, max 255 chars
- `description`: Optional, unlimited
- `created_by`: Required, valid user FK

### Event Model
- `title`: Required, max 255 chars
- `start_time`: Required, valid date
- `duration_minutes`: Required, 1-1440
- `code_text`: Required, unique, max 50 chars
- `code_qr`: Optional, unlimited
- `state`: Required, 'OPEN' or 'CLOSED'
- `group_id`: Required, valid group FK
- `created_by`: Required, valid user FK

### Attendance Model
- `event_id`: Required, valid event FK
- `participant_id`: Optional, valid user FK
- `timestamp`: Required, valid date

---

## Environment Variables Needed

```env
# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=attendance_dev
DB_USER=postgres
DB_PASSWORD=password

# Test Database
DB_HOST_TEST=localhost
DB_PORT_TEST=5432
DB_NAME_TEST=attendance_test
DB_USER_TEST=postgres
DB_PASSWORD_TEST=password
```

---

## Next Steps

1. ✅ **Models Created** - All 4 models with associations
2. ✅ **Migrations Created** - All 4 migrations ready
3. ⏳ **Run Migrations** - Execute `npm run migrate`
4. ⏳ **Create Seeders** - Add demo data (optional)
5. ⏳ **Implement Services** - Wire models to business logic
6. ⏳ **Write Tests** - Unit & integration tests

---

## Helpful Commands

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Check migration status
npx sequelize-cli db:migrate:status

# Undo last migration
npx sequelize-cli db:migrate:undo

# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Access database
psql -U postgres -h localhost -d attendance_dev

# Create fresh database and run migrations
npm run migrate -- --env development
```
