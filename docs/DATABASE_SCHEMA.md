 Database Schema Documentation

 Overview

The Event Attendance Monitoring System uses a relational database with four main tables:
- `users` - Event Organizer accounts
- `event_groups` - Groupings of related events
- `events` - Individual events with check-in codes
- `check_ins` - Participant attendance records

This document provides detailed schema specifications.

---

 Complete Schema Definition

 Table: `users`

Stores Event Organizer (EO) account information.

SQL Definition:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR() NOT NULL UNIQUE,
  password_hash VARCHAR() NOT NULL,
  name VARCHAR() NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

Fields:

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `email` | VARCHAR() | NOT NULL, UNIQUE | Login identifier |
| `password_hash` | VARCHAR() | NOT NULL | Bcrypt hashed password |
| `name` | VARCHAR() | NOT NULL | Full name of organizer |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

Relationships:
- `:N` with `event_groups` (one EO creates many groups)

Example Data:
```
id: e-eb-d-a-
email: john.organizer@example.com
password_hash: $b$$...
name: John Organizer
created_at: -- ::
updated_at: -- ::
```

---

 Table: `event_groups`

Groups related events managed by a single EO.

SQL Definition:
```sql
CREATE TABLE event_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR() NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_event_groups_user_id
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_event_groups_user_id ON event_groups(user_id);
```

Fields:

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `user_id` | UUID | NOT NULL, FK | Event organizer who owns group |
| `name` | VARCHAR() | NOT NULL | Group name (e.g., "Conference ") |
| `description` | TEXT | NULL | Optional group description |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

Relationships:
- `N:` with `users` (many groups owned by one EO)
- `:N` with `events` (one group contains many events)

Cascade Behavior:
- When a user is deleted, all their event groups are deleted
- When an event group is deleted, all contained events and their check-ins are deleted

Example Data:
```
id: e-eb-d-a-
user_id: e-eb-d-a-
name: Conference 
description: Annual technology conference
created_at: -- ::
updated_at: -- ::
```

---

 Table: `events`

Individual events that participants check in to.

SQL Definition:
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  name VARCHAR() NOT NULL,
  description TEXT,
  location VARCHAR(),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  capacity INT,
  state VARCHAR() NOT NULL DEFAULT 'OPEN',
  access_code VARCHAR() NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_events_group_id
    FOREIGN KEY (group_id)
    REFERENCES event_groups(id)
    ON DELETE CASCADE,
  
  CONSTRAINT chk_event_state
    CHECK (state IN ('OPEN', 'CLOSED')),
  
  CONSTRAINT chk_end_after_start
    CHECK (end_date >= start_date)
);

CREATE INDEX idx_events_group_id ON events(group_id);
CREATE INDEX idx_events_access_code ON events(access_code);
CREATE INDEX idx_events_state ON events(state);
```

Fields:

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `group_id` | UUID | NOT NULL, FK | Parent event group |
| `name` | VARCHAR() | NOT NULL | Event name |
| `description` | TEXT | NULL | Event details/agenda |
| `location` | VARCHAR() | NULL | Event venue |
| `start_date` | TIMESTAMP | NOT NULL | Event start time |
| `end_date` | TIMESTAMP | NOT NULL | Event end time |
| `capacity` | INT | NULL | Max participant capacity |
| `state` | VARCHAR() | NOT NULL, DEFAULT 'OPEN', CHECK | Check-in status: 'OPEN' or 'CLOSED' |
| `access_code` | VARCHAR() | NOT NULL, UNIQUE | Unique code for text check-in |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

Relationships:
- `N:` with `event_groups` (many events in one group)
- `:N` with `check_ins` (one event has many check-ins)

Constraints:
- `state` can only be 'OPEN' or 'CLOSED'
- `end_date` must be >= `start_date`
- `access_code` is unique across all events
- Cascade delete: removing event also removes all check-ins

Example Data:
```
id: e-eb-d-a-
group_id: e-eb-d-a-
name: Keynote Session
description: Opening keynote address
location: Main Hall
start_date: -- ::
end_date: -- ::
capacity: 
state: OPEN
access_code: ABC--XYZ
created_at: -- ::
updated_at: -- ::
```

---

 Table: `check_ins`

Records of participant attendance.

SQL Definition:
```sql
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  participant_email VARCHAR() NOT NULL,
  participant_name VARCHAR(),
  check_in_method VARCHAR() NOT NULL,
  checked_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_check_ins_event_id
    FOREIGN KEY (event_id)
    REFERENCES events(id)
    ON DELETE CASCADE,
  
  CONSTRAINT chk_check_in_method
    CHECK (check_in_method IN ('TEXT', 'QR'))
);

CREATE INDEX idx_check_ins_event_id ON check_ins(event_id);
CREATE INDEX idx_check_ins_participant_email ON check_ins(participant_email);
CREATE INDEX idx_check_ins_checked_in_at ON check_ins(checked_in_at);
```

Fields:

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `event_id` | UUID | NOT NULL, FK | Event checked into |
| `participant_email` | VARCHAR() | NOT NULL | Participant identifier |
| `participant_name` | VARCHAR() | NULL | Optional participant name |
| `check_in_method` | VARCHAR() | NOT NULL, CHECK | 'TEXT' or 'QR' |
| `checked_in_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Check-in timestamp |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |

Relationships:
- `N:` with `events` (many check-ins for one event)

Constraints:
- `check_in_method` must be 'TEXT' or 'QR'
- Foreign key references `events.id` with cascade delete
- No unique constraint on (event_id, participant_email) to allow multiple check-ins per participant per event (future deduplication logic in application)

Example Data:
```
id: e-eb-d-a-
event_id: e-eb-d-a-
participant_email: jane.participant@example.com
participant_name: Jane Participant
check_in_method: TEXT
checked_in_at: -- ::
created_at: -- ::
```

---

 Entity-Relationship Diagram (ERD)

 Visual Representation

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK, UUID)       │
│ email (UNIQUE)      │
│ password_hash       │
│ name                │
│ created_at          │
│ updated_at          │
└───────────┬─────────┘
            │
            │ :N (CASCADE)
            │
            ▼
┌─────────────────────┐
│  event_groups       │
├─────────────────────┤
│ id (PK, UUID)       │
│ user_id (FK)        │
│ name                │
│ description         │
│ created_at          │
│ updated_at          │
└───────────┬─────────┘
            │
            │ :N (CASCADE)
            │
            ▼
┌─────────────────────┐
│     events          │
├─────────────────────┤
│ id (PK, UUID)       │
│ group_id (FK)       │
│ name                │
│ description         │
│ location            │
│ start_date          │
│ end_date            │
│ capacity            │
│ state (ENUM)        │
│ access_code (UNIQ)  │
│ created_at          │
│ updated_at          │
└───────────┬─────────┘
            │
            │ :N (CASCADE)
            │
            ▼
┌─────────────────────┐
│    check_ins        │
├─────────────────────┤
│ id (PK, UUID)       │
│ event_id (FK)       │
│ participant_email   │
│ participant_name    │
│ check_in_method     │
│ checked_in_at       │
│ created_at          │
└─────────────────────┘
```

---

 Data Integrity & Constraints

 Primary Keys
All tables use UUID primary keys for:
- Globally unique identifiers across systems
- Security (not sequential/guessable)
- Support for distributed systems

 Foreign Keys
Enforced relationships with cascade delete:
```
users.id ← event_groups.user_id (CASCADE)
event_groups.id ← events.group_id (CASCADE)
events.id ← check_ins.event_id (CASCADE)
```

 Unique Constraints
- `users.email` - One account per email
- `events.access_code` - Unique code per event

 Check Constraints
- `events.state IN ('OPEN', 'CLOSED')`
- `events.end_date >= events.start_date`
- `check_ins.check_in_method IN ('TEXT', 'QR')`

 Default Values
All timestamp fields default to current time:
- `created_at` - Immutable
- `updated_at` - Modified on record updates

---

 Indices & Performance

 Index Strategy

Covered Indices (for common queries):

| Table | Index | Purpose |
|-------|-------|---------|
| `users` | `idx_users_email` | Fast login by email |
| `event_groups` | `idx_event_groups_user_id` | List groups by organizer |
| `events` | `idx_events_group_id` | List events in group |
| `events` | `idx_events_access_code` | Validate check-in code |
| `events` | `idx_events_state` | Filter by OPEN/CLOSED |
| `check_ins` | `idx_check_ins_event_id` | List check-ins per event |
| `check_ins` | `idx_check_ins_participant_email` | Search by participant |
| `check_ins` | `idx_check_ins_checked_in_at` | Sort by check-in time |

 Query Optimization

High-frequency queries:
```sql
-- Find user by email (login)
SELECT  FROM users WHERE email = ? [uses idx_users_email]

-- List events in a group
SELECT  FROM events WHERE group_id = ? [uses idx_events_group_id]

-- Validate access code
SELECT  FROM events WHERE access_code = ? [uses idx_events_access_code]

-- List check-ins for event
SELECT  FROM check_ins WHERE event_id = ? [uses idx_check_ins_event_id]

-- Export attendance with timestamps
SELECT  FROM check_ins WHERE event_id = ? ORDER BY checked_in_at [uses idx_check_ins_checked_in_at]
```

---

 Database Initialization

 Creating the Database

PostgreSQL:
```sql
CREATE DATABASE event_attendance_system;
```

MySQL:
```sql
CREATE DATABASE event_attendance_system
  CHARACTER SET utfmb
  COLLATE utfmb_unicode_ci;
```

 Running Migrations

Using Sequelize (Phase  approach):

```bash
 Create migrations
npm run migration:create --name=create-initial-schema

 Run all pending migrations
npm run migrate

 Verify schema
\dt (PostgreSQL) or SHOW TABLES; (MySQL)
```

 Seeding Test Data (Optional)

```javascript
// seeders/seed-test-data.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert test users, groups, events, check-ins
  },
  down: async (queryInterface, Sequelize) => {
    // Rollback seeded data
  }
};
```

---

 Backup & Recovery

 Backup Strategy

PostgreSQL:
```bash
 Full backup
pg_dump -U username event_attendance_system > backup.sql

 Backup with compressed format
pg_dump -U username -F c event_attendance_system > backup.dump
```

MySQL:
```bash
 Full backup
mysqldump -u username -p event_attendance_system > backup.sql

 Backup specific tables
mysqldump -u username -p event_attendance_system users events > tables_backup.sql
```

 Recovery

PostgreSQL:
```bash
 Restore from SQL backup
psql -U username event_attendance_system < backup.sql

 Restore from compressed backup
pg_restore -U username -d event_attendance_system backup.dump
```

MySQL:
```bash
 Restore from SQL backup
mysql -u username -p event_attendance_system < backup.sql
```

---

 Future Extensions

 Phase  Considerations

Additional Tables (Optional):
- `event_codes` - Track code usage/redemption
- `user_sessions` - Track login sessions
- `audit_log` - Track all data modifications

Additional Fields (Optional):
- `events.qr_code_url` - Cache QR code URL
- `check_ins.ip_address` - Geographic tracking
- `check_ins.device_info` - Device/browser used

Denormalization (if needed):
- `events.attendee_count` - Cache check-in count
- `event_groups.event_count` - Cache event count

---

 Summary

This schema provides:
-  Normalized design (NF)
-  Referential integrity via foreign keys
-  Performance via strategic indices
-  Data consistency via constraints
-  Scalability for Phase  expansion

For API documentation, see [API.md](./API.md)  
For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md)
