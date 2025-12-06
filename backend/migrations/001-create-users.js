'use strict';

/ @type {import('sequelize-cli').Migration} /
module.exports = {
  async up(queryInterface, Sequelize) {
    /
      Migration: Create users table
      
      Creates the base users table for event organizers and participants
      
      Columns:
      - id: UUID primary key
      - name: User full name
      - email: Unique email for login
      - password_hash: Bcrypt hashed password
      - role: ENUM (EO=Event Organizer, PARTICIPANT=Regular user)
      - created_at: Timestamp
      - updated_at: Timestamp
     /
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV,
          primaryKey: true,
          allowNull: false,
          comment: 'Unique user identifier (UUID v)',
        },
        name: {
          type: Sequelize.STRING(),
          allowNull: false,
          comment: 'User full name',
        },
        email: {
          type: Sequelize.STRING(),
          allowNull: false,
          unique: true,
          comment: 'Unique email address for login',
        },
        password_hash: {
          type: Sequelize.STRING(),
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
        charset: 'utfmb',
        collate: 'utfmb_unicode_ci',
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
    /
      Rollback: Drop users table
     /
    await queryInterface.dropTable('users');
  },
};
