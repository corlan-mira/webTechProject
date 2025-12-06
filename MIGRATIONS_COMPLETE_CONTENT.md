# Complete Migration Files - Full Content

This document contains the complete content of all migration files for reference.

---

## 001-create-users.js

**Location:** `backend/migrations/001-create-users.js`

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Migration: Create users table
     * 
     * Creates the base users table for event organizers and participants
     * 
     * Columns:
     * - id: UUID primary key
     * - name: User full name
     * - email: Unique email for login
     * - password_hash: Bcrypt hashed password
     * - role: ENUM (EO=Event Organizer, PARTICIPANT=Regular user)
     * - created_at: Timestamp
     * - updated_at: Timestamp
     */
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
          comment: 'Unique user identifier (UUID v4)',
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: 'User full name',
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
          comment: 'Unique email address for login',
        },
        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: 'Bcrypt hashed password',
        },
        role: {
          type: Sequelize.ENUM('EO', 'PARTICIPANT'),
          allowNull: false,
          defaultValue: 'PARTICIPANT',
          comment: 'User role: EO=Event Organizer, PARTICIPANT=Regular user',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      {
        comment: 'Stores user accounts for event organizers and participants',
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      }
    );

    // Create indexes
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_user_email',
      unique: true,
    });

    await queryInterface.addIndex('users', ['role'], {
      name: 'idx_user_role',
    });

    await queryInterface.addIndex('users', ['created_at'], {
      name: 'idx_user_created_at',
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Rollback: Drop users table
     */
    await queryInterface.dropTable('users');
  },
};
```

---

## 002-create-event-groups.js

**Location:** `backend/migrations/002-create-event-groups.js`

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Migration: Create event_groups table
     * 
     * Creates groups/collections of related events
     * Owned/created by event organizers (Users with EO role)
     * 
     * Columns:
     * - id: UUID primary key
     * - name: Group name
     * - description: Optional detailed description
     * - created_by: FK to User (organizer)
     * - created_at: Timestamp
     * - updated_at: Timestamp
     */
    await queryInterface.createTable(
      'event_groups',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
          comment: 'Unique event group identifier (UUID v4)',
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: 'Event group name',
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Detailed description of the event group',
        },
        created_by: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          comment: 'FK to User who created this group (Event Organizer)',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      {
        comment: 'Groups of related events created by organizers',
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      }
    );

    // Create indexes
    await queryInterface.addIndex('event_groups', ['created_by'], {
      name: 'idx_event_group_created_by',
    });

    await queryInterface.addIndex('event_groups', ['created_at'], {
      name: 'idx_event_group_created_at',
    });

    await queryInterface.addIndex('event_groups', ['name'], {
      name: 'idx_event_group_name',
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Rollback: Drop event_groups table
     * CASCADE delete will remove all related events
     */
    await queryInterface.dropTable('event_groups');
  },
};
```

---

## 003-create-events.js

**Location:** `backend/migrations/003-create-events.js`

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Migration: Create events table
     * 
     * Creates individual events with check-in capabilities
     * Supports both text-based access codes and QR codes
     * 
     * Columns:
     * - id: UUID primary key
     * - group_id: FK to EventGroup
     * - title: Event title/name
     * - start_time: Event start timestamp
     * - duration_minutes: Event duration in minutes (1-1440)
     * - code_text: Unique text access code for check-in
     * - code_qr: QR code data/URL (generated from code_text)
     * - state: ENUM (OPEN, CLOSED) for check-in state
     * - created_by: FK to User (organizer who created event)
     * - created_at: Timestamp
     * - updated_at: Timestamp
     */
    await queryInterface.createTable(
      'events',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
          comment: 'Unique event identifier (UUID v4)',
        },
        group_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'event_groups',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          comment: 'FK to EventGroup that contains this event',
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: 'Event title/name',
        },
        start_time: {
          type: Sequelize.DATE,
          allowNull: false,
          comment: 'Event start timestamp',
        },
        duration_minutes: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
            max: 1440,
          },
          comment: 'Event duration in minutes (1-1440, max 24 hours)',
        },
        code_text: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
          comment: 'Text-based access code for check-in',
        },
        code_qr: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'QR code data/URL (generated from code_text)',
        },
        state: {
          type: Sequelize.ENUM('OPEN', 'CLOSED'),
          allowNull: false,
          defaultValue: 'OPEN',
          comment: 'Event state: OPEN=accepting check-ins, CLOSED=no check-ins',
        },
        created_by: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          comment: 'FK to User who created this event',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      {
        comment: 'Individual events with check-in capabilities',
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      }
    );

    // Create indexes
    await queryInterface.addIndex('events', ['group_id'], {
      name: 'idx_event_group_id',
    });

    await queryInterface.addIndex('events', ['created_by'], {
      name: 'idx_event_created_by',
    });

    await queryInterface.addIndex('events', ['code_text'], {
      name: 'idx_event_code_text',
      unique: true,
    });

    await queryInterface.addIndex('events', ['state'], {
      name: 'idx_event_state',
    });

    await queryInterface.addIndex('events', ['start_time'], {
      name: 'idx_event_start_time',
    });

    await queryInterface.addIndex('events', ['created_at'], {
      name: 'idx_event_created_at',
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Rollback: Drop events table
     * CASCADE delete will remove all related attendance records
     */
    await queryInterface.dropTable('events');
  },
};
```

---

## 004-create-attendance.js

**Location:** `backend/migrations/004-create-attendance.js`

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Migration: Create attendance table
     * 
     * Records participant check-ins at events
     * Supports both registered users and anonymous participants
     * 
     * Columns:
     * - id: UUID primary key
     * - event_id: FK to Event
     * - participant_id: FK to User (optional, NULL for anonymous check-ins)
     * - timestamp: Exact check-in timestamp
     * - created_at: Record creation timestamp
     * - updated_at: Record update timestamp
     */
    await queryInterface.createTable(
      'attendance',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
          comment: 'Unique attendance record identifier (UUID v4)',
        },
        event_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'events',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          comment: 'FK to Event being attended',
        },
        participant_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
          comment: 'FK to User (participant), NULL for anonymous check-ins',
        },
        timestamp: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          comment: 'Exact check-in timestamp',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      {
        comment: 'Records of participant check-ins at events',
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      }
    );

    // Create indexes
    await queryInterface.addIndex('attendance', ['event_id'], {
      name: 'idx_attendance_event_id',
    });

    await queryInterface.addIndex('attendance', ['participant_id'], {
      name: 'idx_attendance_participant_id',
    });

    await queryInterface.addIndex('attendance', ['timestamp'], {
      name: 'idx_attendance_timestamp',
    });

    await queryInterface.addIndex('attendance', ['event_id', 'participant_id'], {
      name: 'idx_attendance_event_participant',
    });

    await queryInterface.addIndex('attendance', ['created_at'], {
      name: 'idx_attendance_created_at',
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Rollback: Drop attendance table
     */
    await queryInterface.dropTable('attendance');
  },
};
```

---

## Summary

| Migration | File | Creates | Key Features |
|-----------|------|---------|--------------|
| 001 | `001-create-users.js` | users | UUID PK, ENUM role, UNIQUE email |
| 002 | `002-create-event-groups.js` | event_groups | FK to users, CASCADE delete |
| 003 | `003-create-events.js` | events | UNIQUE code_text, ENUM state, FK constraints |
| 004 | `004-create-attendance.js` | attendance | FK with SET NULL, composite indexes |

**Total Migrations:** 4  
**Total Tables Created:** 4  
**Total Indexes:** 16+  
**Database Dialect:** PostgreSQL  
**Data Type:** UUID v4 for all primary keys

### Execution Order
```
001-create-users
  ↓
002-create-event-groups (depends on users)
  ↓
003-create-events (depends on event_groups and users)
  ↓
004-create-attendance (depends on events and users)
```
