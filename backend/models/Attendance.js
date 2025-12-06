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
