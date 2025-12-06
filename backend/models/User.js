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
