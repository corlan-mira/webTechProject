 Sequelize Models and Migrations Documentation

 Overview

This document provides complete documentation for all Sequelize models and migrations for the Attendance Monitoring System. The system uses PostgreSQL as the primary database with full UUID support and proper constraint handling.

---

 Database Schema

 Entity Relationship Diagram

```
┌─────────────┐           ┌──────────────────┐
│   Users     │───────────│  Event Groups    │
│             │         N│                  │
└─────────────┘           └──────────────────┘
       │                           │
       │                         │
       │ (creator)                 │
       │N                         N│
┌──────────────────┐             │
│  Attendance      │         ┌────────────┐
│  (check-ins)     │────────────│  Events    │
└──────────────────┘        N   │            │
       │participant_id      │    └────────────┘
       │                    │
       └──────────────────┘
```

 Table Relationships

```
users (:N) -> event_groups
users (:N) -> events
users (:N) -> attendance
event_groups (:N) -> events
events (:N) -> attendance
```

---

 Model Files

 . User Model (`backend/models/User.js`)

Purpose: Represents both Event Organizers (EO) and Participants in the system.

Table Name: `users`

Fields:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, Default UUIDV | Unique user identifier |
| `name` | VARCHAR() | NOT NULL | User full name |
| `email` | VARCHAR() | NOT NULL, UNIQUE | Email address (login credential) |
| `password_hash` | VARCHAR() | NOT NULL | Bcrypt hashed password |
| `role` | ENUM | NOT NULL, Default 'PARTICIPANT' | Role: `EO` (organizer) or `PARTICIPANT` |
| `created_at` | TIMESTAMP | NOT NULL | Account creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

Indexes:
- `idx_user_email` (UNIQUE) - Fast email lookups for login
- `idx_user_role` - Filter users by role
- `idx_user_created_at` - Sort/filter by creation date

Associations:
```javascript
User.hasMany(EventGroup, {
  foreignKey: 'created_by',  // User creates EventGroups
  as: 'event_groups',
  onDelete: 'CASCADE'
});

User.hasMany(Attendance, {
  foreignKey: 'participant_id',  // User participates in events
  as: 'attendances',
  onDelete: 'CASCADE'
});
```

Validation Rules:
- Email must be valid email format
- Email must be unique across system
- Name required, max  characters
- Password hash required, max  characters
- Role must be 'EO' or 'PARTICIPANT'

---

 . EventGroup Model (`backend/models/EventGroup.js`)

Purpose: Groups/collections of related events created by organizers.

Table Name: `event_groups`

Fields:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, Default UUIDV | Unique event group identifier |
| `name` | VARCHAR() | NOT NULL | Group name |
| `description` | TEXT | Nullable | Detailed description |
| `created_by` | UUID | NOT NULL, FK→users.id | Event organizer who created group |
| `created_at` | TIMESTAMP | NOT NULL | Group creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

Indexes:
- `idx_event_group_created_by` - Find groups by organizer
- `idx_event_group_created_at` - Sort by creation date
- `idx_event_group_name` - Search by group name

Foreign Keys:
```sql
CONSTRAINT fk_event_group_created_by
  FOREIGN KEY (created_by) REFERENCES users(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE
```

Associations:
```javascript
EventGroup.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

EventGroup.hasMany(Event, {
  foreignKey: 'group_id',
  as: 'events',
  onDelete: 'CASCADE'
});
```

---

 . Event Model (`backend/models/Event.js`)

Purpose: Individual events with check-in capabilities. Supports text codes and QR codes.

Table Name: `events`

Fields:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, Default UUIDV | Unique event identifier |
| `group_id` | UUID | NOT NULL, FK→event_groups.id | Parent event group |
| `title` | VARCHAR() | NOT NULL | Event title/name |
| `start_time` | TIMESTAMP | NOT NULL | Event start time |
| `duration_minutes` | INTEGER | NOT NULL, Min , Max  | Duration in minutes (-) |
| `code_text` | VARCHAR() | NOT NULL, UNIQUE | Text access code for check-in |
| `code_qr` | TEXT | Nullable | QR code data/URL |
| `state` | ENUM | NOT NULL, Default 'OPEN' | State: `OPEN` or `CLOSED` |
| `created_by` | UUID | NOT NULL, FK→users.id | Event creator (organizer) |
| `created_at` | TIMESTAMP | NOT NULL | Event creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

Indexes:
- `idx_event_group_id` - Find events in a group
- `idx_event_created_by` - Find events by organizer
- `idx_event_code_text` (UNIQUE) - Fast access code lookup
- `idx_event_state` - Filter by OPEN/CLOSED
- `idx_event_start_time` - Sort by start time
- `idx_event_created_at` - Sort by creation

Foreign Keys:
```sql
CONSTRAINT fk_event_group_id
  FOREIGN KEY (group_id) REFERENCES event_groups(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE

CONSTRAINT fk_event_created_by
  FOREIGN KEY (created_by) REFERENCES users(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE
```

Associations:
```javascript
Event.belongsTo(EventGroup, {
  foreignKey: 'group_id',
  as: 'group'
});

Event.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

Event.hasMany(Attendance, {
  foreignKey: 'event_id',
  as: 'attendances',
  onDelete: 'CASCADE'
});
```

---

 . Attendance Model (`backend/models/Attendance.js`)

Purpose: Records participant check-ins at events. Supports both registered users and anonymous participants.

Table Name: `attendance`

Fields:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, Default UUIDV | Unique check-in record ID |
| `event_id` | UUID | NOT NULL, FK→events.id | Event being attended |
| `participant_id` | UUID | Nullable, FK→users.id | Participant (NULL for anonymous) |
| `timestamp` | TIMESTAMP | NOT NULL, Default NOW | Exact check-in time |
| `created_at` | TIMESTAMP | NOT NULL | Record creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Record update timestamp |

Indexes:
- `idx_attendance_event_id` - Find check-ins for an event
- `idx_attendance_participant_id` - Find check-ins by participant
- `idx_attendance_timestamp` - Sort by check-in time
- `idx_attendance_event_participant` - Composite for duplicate detection
- `idx_attendance_created_at` - Sort by record creation

Foreign Keys:
```sql
CONSTRAINT fk_attendance_event_id
  FOREIGN KEY (event_id) REFERENCES events(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE

CONSTRAINT fk_attendance_participant_id
  FOREIGN KEY (participant_id) REFERENCES users(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE
```

Associations:
```javascript
Attendance.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});

Attendance.belongsTo(User, {
  foreignKey: 'participant_id',
  as: 'participant',
  onDelete: 'SET NULL'  // Keep record if user deleted
});
```

---

 Migration Files

 Migration Execution Order

Migrations should be run in this order:

. -create-users.js - Base table for all users
. -create-event-groups.js - Event groups owned by users
. -create-events.js - Events in event groups
. -create-attendance.js - Check-in records

 Migration Naming Convention

```
NNN-create-{tablename}.js
```

where `NNN` is a zero-padded sequence number (, , , etc.)

---

 Migration : Users Table (`-create-users.js`)

Purpose: Create base users table for organizers and participants.

Operations:
. Create `users` table with columns
. Create UNIQUE index on email
. Create index on role for filtering
. Create index on created_at for sorting

Key Features:
- UUID primary key (UUIDV)
- ENUM type for role
- Unique constraint on email
- Charset: utfmb (emoji support)
- Collation: utfmb_unicode_ci

Example SQL:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR() NOT NULL,
  email VARCHAR() NOT NULL UNIQUE,
  password_hash VARCHAR() NOT NULL,
  role ENUM('EO', 'PARTICIPANT') NOT NULL DEFAULT 'PARTICIPANT',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARSET utfmb COLLATE utfmb_unicode_ci;

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_created_at ON users(created_at);
```

---

 Migration : Event Groups Table (`-create-event-groups.js`)

Purpose: Create event groups table for organizing related events.

Operations:
. Create `event_groups` table
. Add foreign key constraint to users (created_by)
. Create indexes on created_by, created_at, name

Referential Integrity:
- `created_by` references `users(id)`
- CASCADE delete: Deleting user removes their event groups
- CASCADE update: Updating user ID updates foreign key

Example SQL:
```sql
CREATE TABLE event_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR() NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARSET utfmb COLLATE utfmb_unicode_ci;

CREATE INDEX idx_event_group_created_by ON event_groups(created_by);
CREATE INDEX idx_event_group_created_at ON event_groups(created_at);
CREATE INDEX idx_event_group_name ON event_groups(name);
```

---

 Migration : Events Table (`-create-events.js`)

Purpose: Create events table with check-in capabilities.

Operations:
. Create `events` table
. Add foreign key to event_groups (group_id)
. Add foreign key to users (created_by)
. Create UNIQUE index on code_text
. Create composite and individual indexes

Column Specifications:
- `duration_minutes`: Check constraint ( to )
- `state`: ENUM with 'OPEN' default
- `code_text`: UNIQUE for access code lookup

Example SQL:
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES event_groups(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title VARCHAR() NOT NULL,
  start_time TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >=  AND duration_minutes <= ),
  code_text VARCHAR() NOT NULL UNIQUE,
  code_qr TEXT,
  state ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARSET utfmb COLLATE utfmb_unicode_ci;

CREATE INDEX idx_event_group_id ON events(group_id);
CREATE INDEX idx_event_created_by ON events(created_by);
CREATE INDEX idx_event_code_text ON events(code_text);
CREATE INDEX idx_event_state ON events(state);
CREATE INDEX idx_event_start_time ON events(start_time);
CREATE INDEX idx_event_created_at ON events(created_at);
```

---

 Migration : Attendance Table (`-create-attendance.js`)

Purpose: Create attendance/check-in records table.

Operations:
. Create `attendance` table
. Add foreign key to events (event_id) - CASCADE delete
. Add foreign key to users (participant_id) - SET NULL on delete
. Create indexes for queries

Special Handling:
- `participant_id` is nullable (supports anonymous check-ins)
- ON DELETE SET NULL (keeps check-in record even if participant deleted)
- Composite index for duplicate detection

Example SQL:
```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
  participant_id UUID REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARSET utfmb COLLATE utfmb_unicode_ci;

CREATE INDEX idx_attendance_event_id ON attendance(event_id);
CREATE INDEX idx_attendance_participant_id ON attendance(participant_id);
CREATE INDEX idx_attendance_timestamp ON attendance(timestamp);
CREATE INDEX idx_attendance_event_participant ON attendance(event_id, participant_id);
CREATE INDEX idx_attendance_created_at ON attendance(created_at);
```

---

 Sequelize Configuration

 Connection Setup

File: `backend/config/sequelize.js`

```javascript
const { Sequelize } = require('sequelize');
const dbConfig = require('./database');

const sequelize = new Sequelize(
  dbConfig[process.env.NODE_ENV || 'development']
);

module.exports = sequelize;
```

 Database Configuration

File: `backend/config/database.js`

```javascript
module.exports = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || ,
    database: process.env.DB_NAME || 'attendance_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    logging: console.log,
    pool: {
      min: ,
      max: 
    }
  },
  test: {
    dialect: 'postgres',
    host: process.env.DB_HOST_TEST || 'localhost',
    port: process.env.DB_PORT_TEST || ,
    database: process.env.DB_NAME_TEST || 'attendance_test',
    username: process.env.DB_USER_TEST || 'postgres',
    password: process.env.DB_PASSWORD_TEST || '',
    logging: false,
    pool: {
      min: ,
      max: 
    }
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || ,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      min: ,
      max: 
    }
  }
};
```

---

 Using Migrations with Sequelize CLI

 Installation

```bash
npm install --save-dev sequelize-cli
```

 Configuration

Create `.sequelizerc` in project root:

```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('backend/config', 'database.js'),
  'models-path': path.resolve('backend/models'),
  'seeders-path': path.resolve('backend/seeders'),
  'migrations-path': path.resolve('backend/migrations'),
};
```

 Running Migrations

```bash
 Run all pending migrations
npx sequelize-cli db:migrate

 Undo last migration
npx sequelize-cli db:migrate:undo

 Undo all migrations
npx sequelize-cli db:migrate:undo:all
```

 Checking Migration Status

```bash
npx sequelize-cli db:migrate:status
```

---

 Data Integrity & Constraints

 Primary Keys (All UUID v)

- Globally unique across all databases
- Secure (not guessable like auto-increment IDs)
- Suitable for distributed systems
- Indexed automatically by Sequelize

 Foreign Key Constraints

Cascade Delete:
```
User deleted → All EventGroups deleted → All Events deleted → All Attendance deleted
```

Set Null on Delete:
```
User deleted → Attendance.participant_id = NULL (record preserved)
```

 Unique Constraints

- `users.email` - Prevents duplicate accounts
- `events.code_text` - Prevents duplicate event codes

 Check Constraints

- `events.duration_minutes` - Must be - minutes
- `events.state` - Must be 'OPEN' or 'CLOSED'

---

 Indexes Performance

 Lookup Indexes (Fast queries)
- `users.email` - Login by email
- `events.code_text` - Find event by access code
- `attendance.event_id` - Get all check-ins for event

 Filter Indexes (WHERE clauses)
- `users.role` - Find organizers or participants
- `events.state` - Find OPEN events
- `events.group_id` - Find events in group

 Composite Indexes (Multiple conditions)
- `(event_id, participant_id)` - Duplicate check-in detection

 Sorting/Range Indexes
- `created_at` fields - Sort by date created
- `events.start_time` - Range queries on event dates

---

 Example Queries

 Create User
```javascript
const user = await User.create({
  name: 'John Organizer',
  email: 'john@example.com',
  password_hash: bcryptHash,
  role: 'EO'
});
```

 Create Event Group
```javascript
const group = await EventGroup.create({
  name: 'Fall  Events',
  description: 'All events for fall semester',
  created_by: userId
});
```

 Create Event
```javascript
const event = await Event.create({
  group_id: groupId,
  title: 'Introduction to Node.js',
  start_time: new Date('-- ::'),
  duration_minutes: ,
  code_text: 'NODE',
  state: 'OPEN',
  created_by: organizerId
});
```

 Record Check-in
```javascript
const attendance = await Attendance.create({
  event_id: eventId,
  participant_id: userId,  // null for anonymous
  timestamp: new Date()
});
```

 Find Event by Code
```javascript
const event = await Event.findOne({
  where: { code_text: 'NODE' }
});
```

 Get All Check-ins for Event
```javascript
const checkIns = await Attendance.findAll({
  where: { event_id: eventId },
  include: [
    { association: 'participant', attributes: ['id', 'name', 'email'] }
  ],
  order: [['timestamp', 'ASC']]
});
```

 Get Organizer's Events
```javascript
const organizer = await User.findByPk(userId, {
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

---

 Summary

| Entity | Table | Records | Purpose |
|--------|-------|---------|---------|
| User | `users` | -K | Event organizers and participants |
| EventGroup | `event_groups` | -K | Collections of related events |
| Event | `events` | -K | Individual events with check-in |
| Attendance | `attendance` | K-K | Check-in records |

Total Tables:   
Total Indexes: +  
Total Migrations:   
Database: PostgreSQL +  
ORM: Sequelize +
