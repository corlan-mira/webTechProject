'use strict';

/ @type {import('sequelize-cli').Migration} /
module.exports = {
  async up(queryInterface, Sequelize) {
    /
      Migration: Create events table
      
      Creates individual events with check-in capabilities
      Supports both text-based access codes and QR codes
      
      Columns:
      - id: UUID primary key
      - group_id: FK to EventGroup
      - title: Event title/name
      - start_time: Event start timestamp
      - duration_minutes: Event duration in minutes (-)
      - code_text: Unique text access code for check-in
      - code_qr: QR code data/URL (generated from code_text)
      - state: ENUM (OPEN, CLOSED) for check-in state
      - created_by: FK to User (organizer who created event)
      - created_at: Timestamp
      - updated_at: Timestamp
     /
    await queryInterface.createTable(
      'events',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV,
          primaryKey: true,
          allowNull: false,
          comment: 'Unique event identifier (UUID v)',
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
          type: Sequelize.STRING(),
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
            min: ,
            max: ,
          },
          comment: 'Event duration in minutes (-, max  hours)',
        },
        code_text: {
          type: Sequelize.STRING(),
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
        charset: 'utfmb',
        collate: 'utfmb_unicode_ci',
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
    /
      Rollback: Drop events table
      CASCADE delete will remove all related attendance records
     /
    await queryInterface.dropTable('events');
  },
};
