 Entity-Relationship (ER) Diagram
 Attendance Monitoring System

---

 . Visual ER Diagram (Text Format)

 ASCII Representation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ATTENDANCE MONITORING SYSTEM ER DIAGRAM                   │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │    users     │
                              ├──────────────┤
                              │ PK: id       │
                              │ • email      │
                              │ • password   │
                              │ • name       │
                              │ • created_at │
                              │ • updated_at │
                              └──────────┬───┘
                                         │
                    ┌────────────────────┤
                    │ :N Relationship   │
                    │ (owns)             │
                    ▼                    │
         ┌──────────────────────┐       │
         │  event_groups        │       │
         ├──────────────────────┤       │
         │ PK: id               │       │
         │ FK: user_id ◄────────┘
         │ • name               │
         │ • description        │
         │ • created_at         │
         │ • updated_at         │
         └──────────┬───────────┘
                    │
    ┌───────────────┤
    │ :N           │
    │ (contains)    │
    ▼               │
┌──────────────────────────────────────┐
│         events                       │
├──────────────────────────────────────┤
│ PK: id                               │
│ FK: event_group_id ◄────────────────┘
│ • name                               │
│ • start_date                         │
│ • end_date                           │
│ • state (OPEN/CLOSED)                │
│ • access_code                        │
│ • qr_code_url                        │
│ • created_at                         │
│ • updated_at                         │
└──────────┬──────────────────────────┘
           │
      ┌────┤
      │    │ :N
      │    │ (generates)
      │    │
      ▼    ▼
┌────────────────────────────────────────┐
│     attendance (check_ins)             │
├────────────────────────────────────────┤
│ PK: id                                 │
│ FK: event_id ◄─────────────────────────┘
│ • participant_name                     │
│ • participant_email                    │
│ • check_in_method (TEXT/QR)            │
│ • checked_in_at                        │
│ • created_at                           │
└────────────────────────────────────────┘
```

---

 . Detailed Table Descriptions

 Table : `users`

Purpose: Stores Event Organizer (EO) account information and authentication credentials.

Table Structure:

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for user |
| `email` | VARCHAR() | NOT NULL, UNIQUE, INDEX | User's email address (login identifier) |
| `password_hash` | VARCHAR() | NOT NULL | Bcrypt hashed password (+ rounds) |
| `name` | VARCHAR() | NOT NULL | Full name of event organizer |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last profile update timestamp |

Primary Key:
- `id` (UUID) - Universally Unique Identifier

Indexes:
```sql
CREATE INDEX idx_users_email ON users(email);
```

Relationships:
- :N relationship with `event_groups` - One user can create multiple event groups
- Cascade Delete: When a user is deleted, all related event_groups are deleted

Data Type Justifications:
- UUID: Better than SERIAL for distributed systems and data anonymization
- VARCHAR(): Standard size for email and name fields
- TIMESTAMP: Tracks account lifecycle

Example Record:
```json
{
  "id": "e-eb-d-a-",
  "email": "john.doe@university.edu",
  "password_hash": "$b$$NqouLOickgxZMRZoMyeIjZAgcgbXeKeUxWdeSEDxMSrq",
  "name": "John Doe",
  "created_at": "-- ::",
  "updated_at": "-- ::"
}
```

---

 Table : `event_groups`

Purpose: Organizes events into logical groups for easier management by Event Organizers.

Table Structure:

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique group identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY, INDEX | Reference to organizing EO |
| `name` | VARCHAR() | NOT NULL | Group name (e.g., "Spring  Seminars") |
| `description` | TEXT | NULL | Optional detailed group description |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Group creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last modification timestamp |

Primary Key:
- `id` (UUID) - Unique identifier

Foreign Keys:
```sql
CONSTRAINT fk_event_groups_user_id
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
```

Indexes:
```sql
CREATE INDEX idx_event_groups_user_id ON event_groups(user_id);
```

Relationships:
- N: with `users` - Many groups belong to one EO
- :N with `events` - One group contains multiple events
- Cascade Delete: When user is deleted, all their groups are deleted

Constraints:
```sql
-- Ensure name is not empty
ADD CONSTRAINT chk_event_groups_name 
CHECK (name != '');

-- Ensure user_id is not null
ALTER TABLE event_groups 
ALTER COLUMN user_id SET NOT NULL;
```

Example Record:
```json
{
  "id": "e-eb-d-a-",
  "user_id": "e-eb-d-a-",
  "name": "Spring Conference ",
  "description": "Annual spring conference for computer science department",
  "created_at": "-- ::",
  "updated_at": "-- ::"
}
```

---

 Table : `events`

Purpose: Represents individual events where attendees check in using access codes or QR codes.

Table Structure:

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique event identifier |
| `event_group_id` | UUID | NOT NULL, FOREIGN KEY, INDEX | Parent event group |
| `name` | VARCHAR() | NOT NULL | Event name (e.g., "Keynote Presentation") |
| `description` | TEXT | NULL | Detailed event description |
| `start_date` | TIMESTAMP | NOT NULL | Event start time |
| `end_date` | TIMESTAMP | NOT NULL | Event end time |
| `state` | VARCHAR() | NOT NULL, DEFAULT 'OPEN', CHECK | Check-in availability (OPEN/CLOSED) |
| `access_code` | VARCHAR() | NOT NULL, UNIQUE, INDEX | Text-based check-in code |
| `qr_code_url` | VARCHAR() | NULL | URL to QR code image (generated) |
| `location` | VARCHAR() | NULL | Physical/virtual event location |
| `max_attendees` | INT | NULL | Optional capacity limit |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Event creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last modification timestamp |

Primary Key:
- `id` (UUID) - Unique identifier

Foreign Keys:
```sql
CONSTRAINT fk_events_event_group_id
  FOREIGN KEY (event_group_id)
  REFERENCES event_groups(id)
  ON DELETE CASCADE
```

Unique Constraints:
```sql
CONSTRAINT uq_events_access_code 
UNIQUE (access_code);
```

Check Constraints:
```sql
CONSTRAINT chk_events_state 
CHECK (state IN ('OPEN', 'CLOSED'));

CONSTRAINT chk_events_dates 
CHECK (end_date >= start_date);

CONSTRAINT chk_events_max_attendees 
CHECK (max_attendees IS NULL OR max_attendees > );
```

Indexes:
```sql
CREATE INDEX idx_events_event_group_id ON events(event_group_id);
CREATE INDEX idx_events_access_code ON events(access_code);
CREATE INDEX idx_events_state ON events(state);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
```

Relationships:
- N: with `event_groups` - Multiple events in one group
- :N with `attendance` - One event has many check-ins
- Cascade Delete: When group is deleted, all events are deleted

Example Record:
```json
{
  "id": "e-eb-d-a-",
  "event_group_id": "e-eb-d-a-",
  "name": "Keynote: AI in Education",
  "description": "Opening keynote speech on artificial intelligence applications in education",
  "start_date": "-- ::",
  "end_date": "-- ::",
  "state": "OPEN",
  "access_code": "ABC",
  "qr_code_url": "https://api.qrserver.com/v/create-qr-code/?size=x&data=ABC",
  "location": "Main Auditorium",
  "max_attendees": ,
  "created_at": "-- ::",
  "updated_at": "-- ::"
}
```

---

 Table : `attendance` (aka `check_ins`)

Purpose: Records every participant check-in event with metadata about how they checked in.

Table Structure:

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique check-in record identifier |
| `event_id` | UUID | NOT NULL, FOREIGN KEY, INDEX | Reference to event |
| `participant_name` | VARCHAR() | NOT NULL | Full name of participant |
| `participant_email` | VARCHAR() | NULL, INDEX | Optional participant email |
| `check_in_method` | VARCHAR() | NOT NULL, CHECK | How participant checked in (TEXT/QR) |
| `checked_in_at` | TIMESTAMP | NOT NULL | Exact check-in timestamp |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

Primary Key:
- `id` (UUID) - Unique identifier for each check-in

Foreign Keys:
```sql
CONSTRAINT fk_attendance_event_id
  FOREIGN KEY (event_id)
  REFERENCES events(id)
  ON DELETE CASCADE
```

Check Constraints:
```sql
CONSTRAINT chk_attendance_method 
CHECK (check_in_method IN ('TEXT', 'QR'));
```

Indexes:
```sql
CREATE INDEX idx_attendance_event_id ON attendance(event_id);
CREATE INDEX idx_attendance_email ON attendance(participant_email);
CREATE INDEX idx_attendance_checked_in ON attendance(checked_in_at);
CREATE INDEX idx_attendance_event_name ON attendance(event_id, participant_name);
```

Relationships:
- N: with `events` - Multiple check-ins for one event
- Cascade Delete: When event is deleted, all check-ins are deleted

Example Records:
```json
{
  "id": "e-eb-d-a-",
  "event_id": "e-eb-d-a-",
  "participant_name": "Alice Johnson",
  "participant_email": "alice.johnson@student.edu",
  "check_in_method": "TEXT",
  "checked_in_at": "-- ::",
  "created_at": "-- ::"
},
{
  "id": "e-eb-d-a-",
  "event_id": "e-eb-d-a-",
  "participant_name": "Bob Smith",
  "participant_email": "bob.smith@student.edu",
  "check_in_method": "QR",
  "checked_in_at": "-- ::",
  "created_at": "-- ::"
}
```

---

 . Relationship Summary

 Cardinality Diagram

```
┌─────────────┐         ┌──────────────────┐
│   users     │   : N  │  event_groups    │
│             │◄────────│                  │
│ (organizer) │ (owns)  │ (group of events)│
└─────────────┘         └────────┬─────────┘
                                 │
                             : N │
                           (contains)
                                 │
                       ┌─────────▼────────┐
                       │     events       │
                       │ (single event)   │
                       └─────────┬────────┘
                                 │
                             : N │
                        (generates)
                                 │
                     ┌───────────▼──────────┐
                     │    attendance        │
                     │  (check-in record)   │
                     └──────────────────────┘
```

 Relationship Types

| From | To | Cardinality | Type | Deletion |
|------|-----|-----------|------|----------|
| `users` | `event_groups` |  : N | Parent-Child | Cascade |
| `event_groups` | `events` |  : N | Parent-Child | Cascade |
| `events` | `attendance` |  : N | Parent-Child | Cascade |

Total Relationship Chain: `users` → `event_groups` → `events` → `attendance`
- One user can have unlimited event groups
- One event group can have unlimited events
- One event can have unlimited check-ins
- Deleting a user cascades deletion through entire hierarchy

---

 . Data Model Explanation

 Normalization

The schema follows Third Normal Form (NF):

First Normal Form (NF):
-  All attributes contain atomic (indivisible) values
-  No repeating groups
-  Each row is unique

Second Normal Form (NF):
-  Meets NF
-  No partial dependencies (non-key attributes depend on entire primary key)
-  All non-key attributes depend fully on PK

Third Normal Form (NF):
-  Meets NF
-  No transitive dependencies
-  Non-key attributes depend only on primary key, not on other non-key attributes

 Entity Relationship Logic

Example Scenario: Creating an event with check-ins

```
. EO "John Doe" (users.id = user_)
   ↓
. Creates "Spring Conference" (event_groups.id = group_, user_id = user_)
   ↓
. Adds "Keynote" event (events.id = event_, event_group_id = group_)
   ↓
. Participants check in:
   - Alice via TEXT (attendance.id = check_)
   - Bob via QR (attendance.id = check_)

Deletion chain (if John deleted):
   user_ → group_ → event_ → [check_, check_]
   (cascade delete all)
```

---

 . Constraint Specifications

 Primary Key Constraints

```sql
-- users
ALTER TABLE users ADD CONSTRAINT pk_users PRIMARY KEY (id);

-- event_groups
ALTER TABLE event_groups ADD CONSTRAINT pk_event_groups PRIMARY KEY (id);

-- events
ALTER TABLE events ADD CONSTRAINT pk_events PRIMARY KEY (id);

-- attendance
ALTER TABLE attendance ADD CONSTRAINT pk_attendance PRIMARY KEY (id);
```

 Foreign Key Constraints

```sql
-- event_groups references users
ALTER TABLE event_groups 
ADD CONSTRAINT fk_event_groups_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- events references event_groups
ALTER TABLE events 
ADD CONSTRAINT fk_events_event_group_id
FOREIGN KEY (event_group_id) REFERENCES event_groups(id) ON DELETE CASCADE;

-- attendance references events
ALTER TABLE attendance 
ADD CONSTRAINT fk_attendance_event_id
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
```

 Unique Constraints

```sql
-- users.email is unique
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);

-- events.access_code is unique (each event has unique check-in code)
ALTER TABLE events ADD CONSTRAINT uq_events_access_code UNIQUE (access_code);
```

 Check Constraints

```sql
-- events.state can only be OPEN or CLOSED
ALTER TABLE events 
ADD CONSTRAINT chk_events_state 
CHECK (state IN ('OPEN', 'CLOSED'));

-- events.end_date must be >= start_date
ALTER TABLE events 
ADD CONSTRAINT chk_events_dates 
CHECK (end_date >= start_date);

-- attendance.check_in_method can only be TEXT or QR
ALTER TABLE attendance 
ADD CONSTRAINT chk_attendance_method 
CHECK (check_in_method IN ('TEXT', 'QR'));

-- events.max_attendees must be positive (if set)
ALTER TABLE events 
ADD CONSTRAINT chk_events_capacity 
CHECK (max_attendees IS NULL OR max_attendees > );
```

 Not Null Constraints

```sql
-- users
ALTER TABLE users MODIFY email VARCHAR() NOT NULL;
ALTER TABLE users MODIFY password_hash VARCHAR() NOT NULL;
ALTER TABLE users MODIFY name VARCHAR() NOT NULL;

-- event_groups
ALTER TABLE event_groups MODIFY user_id UUID NOT NULL;
ALTER TABLE event_groups MODIFY name VARCHAR() NOT NULL;

-- events
ALTER TABLE events MODIFY event_group_id UUID NOT NULL;
ALTER TABLE events MODIFY name VARCHAR() NOT NULL;
ALTER TABLE events MODIFY start_date TIMESTAMP NOT NULL;
ALTER TABLE events MODIFY end_date TIMESTAMP NOT NULL;
ALTER TABLE events MODIFY state VARCHAR() NOT NULL;
ALTER TABLE events MODIFY access_code VARCHAR() NOT NULL;

-- attendance
ALTER TABLE attendance MODIFY event_id UUID NOT NULL;
ALTER TABLE attendance MODIFY participant_name VARCHAR() NOT NULL;
ALTER TABLE attendance MODIFY check_in_method VARCHAR() NOT NULL;
ALTER TABLE attendance MODIFY checked_in_at TIMESTAMP NOT NULL;
```

---

 . Index Strategy

 Performance Indexes

| Table | Column(s) | Type | Rationale |
|-------|-----------|------|-----------|
| `users` | `email` | UNIQUE | Login lookup optimization |
| `event_groups` | `user_id` | REGULAR | Find all groups by organizer |
| `events` | `event_group_id` | REGULAR | Find all events in group |
| `events` | `access_code` | UNIQUE | Lookup event by check-in code |
| `events` | `state` | REGULAR | Query OPEN/CLOSED events |
| `events` | `(start_date, end_date)` | COMPOSITE | Range queries for active events |
| `attendance` | `event_id` | REGULAR | Get check-ins for event |
| `attendance` | `participant_email` | REGULAR | Find participant records |
| `attendance` | `checked_in_at` | REGULAR | Sort/filter by check-in time |
| `attendance` | `(event_id, participant_name)` | COMPOSITE | List attendees per event |

 Index Creation Queries

```sql
-- users
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- event_groups
CREATE INDEX idx_event_groups_user_id ON event_groups(user_id);

-- events
CREATE INDEX idx_events_event_group_id ON events(event_group_id);
CREATE UNIQUE INDEX idx_events_access_code ON events(access_code);
CREATE INDEX idx_events_state ON events(state);
CREATE INDEX idx_events_dates ON events(start_date, end_date);

-- attendance
CREATE INDEX idx_attendance_event_id ON attendance(event_id);
CREATE INDEX idx_attendance_participant_email ON attendance(participant_email);
CREATE INDEX idx_attendance_checked_in_at ON attendance(checked_in_at);
CREATE INDEX idx_attendance_event_attendees ON attendance(event_id, participant_name);
```

---

 . Sample Data Queries

 Query : Get All Events for an Organizer

```sql
SELECT 
  e.id,
  e.name,
  e.start_date,
  e.state,
  e.access_code,
  eg.name AS group_name
FROM events e
JOIN event_groups eg ON e.event_group_id = eg.id
WHERE eg.user_id = 'user-uuid-here'
ORDER BY e.start_date DESC;
```

 Query : Get Attendance for an Event

```sql
SELECT 
  a.id,
  a.participant_name,
  a.participant_email,
  a.check_in_method,
  a.checked_in_at
FROM attendance a
WHERE a.event_id = 'event-uuid-here'
ORDER BY a.checked_in_at ASC;
```

 Query : Check-in Count by Event

```sql
SELECT 
  e.name,
  e.access_code,
  COUNT(a.id) AS attendee_count,
  e.max_attendees
FROM events e
LEFT JOIN attendance a ON e.id = a.event_id
WHERE e.event_group_id = 'group-uuid-here'
GROUP BY e.id, e.name, e.access_code, e.max_attendees
ORDER BY e.start_date DESC;
```

 Query : Verify Access Code Uniqueness

```sql
SELECT 
  access_code,
  COUNT() as occurrences
FROM events
GROUP BY access_code
HAVING COUNT() > ;  -- Should return no rows
```

 Query : Find Check-ins by Method

```sql
SELECT 
  check_in_method,
  COUNT() as total
FROM attendance
WHERE event_id = 'event-uuid-here'
GROUP BY check_in_method;
```

---

 . Referential Integrity

 Cascade Delete Rules

When a record is deleted, all dependent records are automatically deleted:

```
Delete user (users.id)
  → Delete all event_groups where user_id = user.id
     → Delete all events where event_group_id = group.id
        → Delete all attendance where event_id = event.id
```

Cascade Benefit: Prevents orphaned records

Example:
```sql
-- This deletion cascades:
DELETE FROM users WHERE id = 'user-uuid-here';

-- Results in cascade deletions:
-- . All event_groups owned by this user
-- . All events in those groups
-- . All attendance records for those events
```

---

 . Data Integrity Scenarios

 Scenario : Valid Event Creation

```
. User "John" exists in users table ✓
. Event Group "Spring Conf" exists with John's user_id ✓
. Event "Keynote" created with valid event_group_id ✓
. Access code "ABC" is unique ✓
. Event state is either OPEN or CLOSED ✓
. End date >= start date ✓
→ Event successfully created ✓
```

 Scenario : Invalid Check-in Prevention

```
. User tries to check in to event with access code "ABC" ✓
. System looks up event: found ✓
. Event state is OPEN (not CLOSED) ✓
. Check-in method (TEXT or QR) is valid ✓
. Participant details captured ✓
→ Check-in recorded successfully ✓

If event state was CLOSED:
→ Check-in rejected (event not accepting attendance) ✗
```

 Scenario : Data Consistency

```
Delete an event that has check-ins:
. attendance records reference this event ✓
. ON DELETE CASCADE is defined ✓
. All attendance records automatically deleted ✓
. No orphaned records remain ✓
→ Data remains consistent ✓
```

---

 . Performance Considerations

 Query Performance

High-Performance Queries:
- Finding event by access code: O() with UNIQUE index
- Getting events by organizer: O(n) with event_group_id index
- Counting attendees: O(n log n) with event_id index

Potential Bottlenecks:
- Large attendance tables (M+ records): Use pagination
- Complex joins across all  tables: Consider materialized views
- Export to CSV/XLSX: Implement background jobs

 Scalability

Current Design Supports:
- Thousands of users
- Millions of events
- Tens of millions of check-ins
- Real-time query performance with proper indexing

Optimization Strategies:
. Partition attendance table by event_id
. Archive old events (older than  year)
. Add materialized view for event statistics
. Cache frequently accessed queries

---

 . ER Diagram Summary Table

| Aspect | Details |
|--------|---------|
| Total Tables |  |
| Total Relationships |  (linear hierarchy) |
| Primary Keys |  (all UUID) |
| Foreign Keys |  (all with cascade delete) |
| Unique Constraints |  (email, access_code) |
| Check Constraints |  (state, dates, method, capacity) |
| Total Indexes |  (including PK and FK) |
| Normalization | NF (Third Normal Form) |
| Max Relationships per Entity | :N or N: (no many-to-many) |
| Cascade Behavior | Full cascade on all deletions |

---

 References

- Complete Schema: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- API Documentation: [API.md](./API.md)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Phase  Specification: [PHASE__SPECIFICATION.md](../PHASE__SPECIFICATION.md)

---

Last Updated: December ,   
Status: Complete and Verified  
Next Review: Post-implementation validation
