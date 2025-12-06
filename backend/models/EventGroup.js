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
