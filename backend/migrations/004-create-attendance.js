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
