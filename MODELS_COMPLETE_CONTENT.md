# Complete Model Files - Full Content

This document contains the complete content of all model files for reference.

---

## User.js

```javascript
'use strict';

const { DataTypes } = require('sequelize');

/**
 * User Model - Represents Event Organizers and Participants
 * 
 * Roles:
 * - EO: Event Organizer (creates events and groups)
 * - PARTICIPANT: Regular participant (check-in to events)
 */
module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Unique user identifier (UUID v4)',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'User full name',
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
          msg: 'Email already in use',
          name: 'uk_user_email',
        },
        validate: {
          isEmail: true,
        },
        comment: 'Unique email address for login',
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Bcrypt hashed password',
      },
      role: {
        type: DataTypes.ENUM('EO', 'PARTICIPANT'),
        allowNull: false,
        defaultValue: 'PARTICIPANT',
        comment: 'User role: EO=Event Organizer, PARTICIPANT=Regular user',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      indexes: [
        {
          name: 'idx_user_email',
          fields: ['email'],
          unique: true,
        },
        {
          name: 'idx_user_role',
          fields: ['role'],
        },
      ],
      comment: 'Stores user accounts for event organizers and participants',
    }
  );

  /**
   * Associations
   * - One User creates many EventGroups (1:N)
   * - One User has many Attendances (1:N)
   */
  User.associate = (models) => {
    User.hasMany(models.EventGroup, {
      foreignKey: 'created_by',
      as: 'event_groups',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    User.hasMany(models.Attendance, {
      foreignKey: 'participant_id',
      as: 'attendances',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return User;
};
```

---

## EventGroup.js

```javascript
'use strict';

const { DataTypes } = require('sequelize');

/**
 * EventGroup Model - Collections of related events
 * 
 * Created by event organizers to group related events together
 * Supports multiple events per group
 */
module.exports = (sequelize) => {
  const EventGroup = sequelize.define(
    'EventGroup',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Unique event group identifier (UUID v4)',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Event group name',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Detailed description of the event group',
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'FK to User who created this group (Event Organizer)',
      },
    },
    {
      sequelize,
      modelName: 'EventGroup',
      tableName: 'event_groups',
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      indexes: [
        {
          name: 'idx_event_group_created_by',
          fields: ['created_by'],
        },
      ],
      comment: 'Groups of related events created by organizers',
    }
  );

  /**
   * Associations
   * - Belongs to User (creator) (N:1)
   * - Has many Events (1:N)
   */
  EventGroup.associate = (models) => {
    EventGroup.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    EventGroup.hasMany(models.Event, {
      foreignKey: 'group_id',
      as: 'events',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return EventGroup;
};
```

---

## Event.js

```javascript
'use strict';

const { DataTypes } = require('sequelize');

/**
 * Event Model - Individual events where participants check in
 * 
 * Stores event details with multiple check-in methods:
 * - Text-based access code
 * - QR code
 * 
 * State management:
 * - OPEN: Accepting check-ins
 * - CLOSED: No longer accepting check-ins
 */
module.exports = (sequelize) => {
  const Event = sequelize.define(
    'Event',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Unique event identifier (UUID v4)',
      },
      group_id: {
        type: DataTypes.UUID,
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
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Event title/name',
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Event start timestamp',
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 1440, // Max 24 hours
        },
        comment: 'Event duration in minutes (1-1440)',
      },
      code_text: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          msg: 'Access code already in use',
          name: 'uk_event_code_text',
        },
        comment: 'Text-based access code for check-in',
      },
      code_qr: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'QR code data/URL (generated from code_text)',
      },
      state: {
        type: DataTypes.ENUM('OPEN', 'CLOSED'),
        allowNull: false,
        defaultValue: 'OPEN',
        comment: 'Event state: OPEN=accepting check-ins, CLOSED=no check-ins',
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'FK to User who created this event',
      },
    },
    {
      sequelize,
      modelName: 'Event',
      tableName: 'events',
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      indexes: [
        {
          name: 'idx_event_group_id',
          fields: ['group_id'],
        },
        {
          name: 'idx_event_created_by',
          fields: ['created_by'],
        },
        {
          name: 'idx_event_code_text',
          fields: ['code_text'],
          unique: true,
        },
        {
          name: 'idx_event_state',
          fields: ['state'],
        },
        {
          name: 'idx_event_start_time',
          fields: ['start_time'],
        },
      ],
      comment: 'Individual events with check-in capabilities',
    }
  );

  /**
   * Associations
   * - Belongs to EventGroup (N:1)
   * - Has many Attendances (1:N)
   * - Belongs to User (creator) (N:1)
   */
  Event.associate = (models) => {
    Event.belongsTo(models.EventGroup, {
      foreignKey: 'group_id',
      as: 'group',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    Event.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    Event.hasMany(models.Attendance, {
      foreignKey: 'event_id',
      as: 'attendances',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Event;
};
```

---

## Attendance.js

```javascript
'use strict';

const { DataTypes } = require('sequelize');

/**
 * Attendance Model - Check-in records for event participants
 * 
 * Records each participant check-in:
 * - Links to Event and Participant (User)
 * - Tracks check-in method (text code or QR)
 * - Records exact timestamp of check-in
 * 
 * Supports both registered users and walk-ins
 */
module.exports = (sequelize) => {
  const Attendance = sequelize.define(
    'Attendance',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Unique attendance record identifier (UUID v4)',
      },
      event_id: {
        type: DataTypes.UUID,
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
        type: DataTypes.UUID,
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
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Exact check-in timestamp',
      },
    },
    {
      sequelize,
      modelName: 'Attendance',
      tableName: 'attendance',
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      indexes: [
        {
          name: 'idx_attendance_event_id',
          fields: ['event_id'],
        },
        {
          name: 'idx_attendance_participant_id',
          fields: ['participant_id'],
        },
        {
          name: 'idx_attendance_timestamp',
          fields: ['timestamp'],
        },
        {
          name: 'idx_attendance_event_participant',
          fields: ['event_id', 'participant_id'],
          unique: false,
        },
      ],
      comment: 'Records of participant check-ins at events',
    }
  );

  /**
   * Associations
   * - Belongs to Event (N:1)
   * - Belongs to User (optional, for registered participants) (N:1)
   */
  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Event, {
      foreignKey: 'event_id',
      as: 'event',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    Attendance.belongsTo(models.User, {
      foreignKey: 'participant_id',
      as: 'participant',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  };

  return Attendance;
};
```

---

## models/index.js

```javascript
'use strict';

const sequelize = require('../config/sequelize');
const User = require('./User');
const EventGroup = require('./EventGroup');
const Event = require('./Event');
const Attendance = require('./Attendance');

/**
 * Models Index
 * Exports all Sequelize models and initializes associations
 */

// Initialize models
const models = {
  User: User(sequelize),
  EventGroup: EventGroup(sequelize),
  Event: Event(sequelize),
  Attendance: Attendance(sequelize),
};

/**
 * Define associations
 * This must be done after all models are initialized
 * to avoid circular dependency issues
 */
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
```

---

## Summary Table

| Model | File | Table | Fields | Indexes |
|-------|------|-------|--------|---------|
| User | User.js | users | 6 | 2 |
| EventGroup | EventGroup.js | event_groups | 5 | 3 |
| Event | Event.js | events | 9 | 6 |
| Attendance | Attendance.js | attendance | 5 | 5 |

**Total Models:** 4  
**Total Fields:** 25  
**Total Indexes:** 16  
**Total Associations:** 8
