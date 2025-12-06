'use strict';

const { DataTypes } = require('sequelize');

/
  Event Model - Individual events where participants check in
  
  Stores event details with multiple check-in methods:
  - Text-based access code
  - QR code
  
  State management:
  - OPEN: Accepting check-ins
  - CLOSED: No longer accepting check-ins
 /
module.exports = (sequelize) => {
  const Event = sequelize.define(
    'Event',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV,
        primaryKey: true,
        comment: 'Unique event identifier (UUID v)',
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
        type: DataTypes.STRING(),
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
          min: ,
          max: , // Max  hours
        },
        comment: 'Event duration in minutes (-)',
      },
      code_text: {
        type: DataTypes.STRING(),
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
      charset: 'utfmb',
      collate: 'utfmb_unicode_ci',
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

  /
    Associations
    - Belongs to EventGroup (N:)
    - Has many Attendances (:N)
    - Belongs to User (creator) (N:)
   /
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
