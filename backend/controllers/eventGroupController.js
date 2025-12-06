'use strict';

const { EventGroup, Event } = require('../models');

/**
 * Event Group Controller
 * Handles event group CRUD operations
 * Only event organizers (EO) can create/manage groups
 * 
 * Methods:
 *  - list(req, res): Get all event groups for authenticated user
 *  - create(req, res): Create new event group
 *  - get(req, res): Get single event group with events
 *  - update(req, res): Update event group name/description
 *  - delete(req, res): Delete event group and all associated events
 */

/**
 * List all event groups for authenticated user
 * 
 * Query params:
 *  - page: number (optional, default 1)
 *  - limit: number (optional, default 10, max 100)
 *  - search: string (optional, search by name)
 * 
 * Response:
 *  - 200: List of event groups
 *  - 401: Unauthorized
 *  - 500: Server error
 */
exports.list = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, search } = req.query;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where = { created_by: userId };
    if (search) {
      where.name = {
        [require('sequelize').Op.iLike]: `%${search}%`,
      };
    }

    // Fetch groups with count
    const { count, rows } = await EventGroup.findAndCountAll({
      where,
      include: [
        {
          association: 'events',
          attributes: ['id', 'title', 'state'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset,
    });

    res.status(200).json({
      status: 'success',
      message: 'Event groups retrieved successfully',
      data: {
        groups: rows,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(count / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('List groups error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve event groups',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create new event group
 * 
 * Request body:
 *  - name: string (required, 1-255 chars)
 *  - description: string (optional, up to 5000 chars)
 * 
 * Response:
 *  - 201: Group created
 *  - 400: Validation error
 *  - 401: Unauthorized
 *  - 500: Server error
 */
exports.create = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, description } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Group name is required',
      });
    }

    if (name.length > 255) {
      return res.status(400).json({
        status: 'error',
        message: 'Group name must be 255 characters or less',
      });
    }

    if (description && description.length > 5000) {
      return res.status(400).json({
        status: 'error',
        message: 'Description must be 5000 characters or less',
      });
    }

    // Create group
    const group = await EventGroup.create({
      name: name.trim(),
      description: description?.trim() || null,
      created_by: userId,
    });

    res.status(201).json({
      status: 'success',
      message: 'Event group created successfully',
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        created_at: group.created_at,
      },
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create event group',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get single event group with all events
 * 
 * URL params:
 *  - groupId: UUID
 * 
 * Response:
 *  - 200: Event group with events
 *  - 401: Unauthorized
 *  - 404: Group not found
 *  - 500: Server error
 */
exports.get = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!groupId) {
      return res.status(400).json({
        status: 'error',
        message: 'Group ID is required',
      });
    }

    // Fetch group
    const group = await EventGroup.findOne({
      where: { id: groupId, created_by: userId },
      include: [
        {
          association: 'events',
          attributes: ['id', 'title', 'start_time', 'state'],
          order: [['start_time', 'ASC']],
        },
      ],
    });

    if (!group) {
      return res.status(404).json({
        status: 'error',
        message: 'Event group not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Event group retrieved successfully',
      data: group,
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve event group',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update event group
 * 
 * URL params:
 *  - groupId: UUID
 * 
 * Request body:
 *  - name: string (optional, 1-255 chars)
 *  - description: string (optional, up to 5000 chars)
 * 
 * Response:
 *  - 200: Group updated
 *  - 400: Validation error
 *  - 401: Unauthorized
 *  - 404: Group not found
 *  - 500: Server error
 */
exports.update = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;
    const { name, description } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!groupId) {
      return res.status(400).json({
        status: 'error',
        message: 'Group ID is required',
      });
    }

    if (!name && !description) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one field (name or description) is required',
      });
    }

    // Validation
    if (name && name.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Group name cannot be empty',
      });
    }

    if (name && name.length > 255) {
      return res.status(400).json({
        status: 'error',
        message: 'Group name must be 255 characters or less',
      });
    }

    if (description && description.length > 5000) {
      return res.status(400).json({
        status: 'error',
        message: 'Description must be 5000 characters or less',
      });
    }

    // Find and update group
    const group = await EventGroup.findOne({
      where: { id: groupId, created_by: userId },
    });

    if (!group) {
      return res.status(404).json({
        status: 'error',
        message: 'Event group not found',
      });
    }

    if (name) {
      group.name = name.trim();
    }
    if (description !== undefined) {
      group.description = description?.trim() || null;
    }

    await group.save();

    res.status(200).json({
      status: 'success',
      message: 'Event group updated successfully',
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        updated_at: group.updated_at,
      },
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update event group',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete event group
 * Warning: Deletes all associated events and attendance records
 * 
 * URL params:
 *  - groupId: UUID
 * 
 * Response:
 *  - 200: Group deleted
 *  - 401: Unauthorized
 *  - 404: Group not found
 *  - 500: Server error
 */
exports.delete = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!groupId) {
      return res.status(400).json({
        status: 'error',
        message: 'Group ID is required',
      });
    }

    // Find group
    const group = await EventGroup.findOne({
      where: { id: groupId, created_by: userId },
    });

    if (!group) {
      return res.status(404).json({
        status: 'error',
        message: 'Event group not found',
      });
    }

    // Delete group (CASCADE will delete events and attendance)
    await group.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Event group deleted successfully',
      data: { id: groupId },
    });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete event group',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
