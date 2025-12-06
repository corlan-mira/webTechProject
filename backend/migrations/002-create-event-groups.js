'use strict';

/ @type {import('sequelize-cli').Migration} /
module.exports = {
  async up(queryInterface, Sequelize) {
    /
      Migration: Create event_groups table
      
      Creates groups/collections of related events
      Owned/created by event organizers (Users with EO role)
      
      Columns:
      - id: UUID primary key
      - name: Group name
      - description: Optional detailed description
      - created_by: FK to User (organizer)
      - created_at: Timestamp
      - updated_at: Timestamp
     /
    await queryInterface.createTable(
      'event_groups',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV,
          primaryKey: true,
          allowNull: false,
          comment: 'Unique event group identifier (UUID v)',
        },
        name: {
          type: Sequelize.STRING(),
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
        charset: 'utfmb',
        collate: 'utfmb_unicode_ci',
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
    /
      Rollback: Drop event_groups table
      CASCADE delete will remove all related events
     /
    await queryInterface.dropTable('event_groups');
  },
};
