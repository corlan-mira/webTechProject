'use strict';

const { Event, EventGroup, Attendance } = require('../models');
const { v: uuidv } = require('uuid');

/
  Event Controller
  Handles event CRUD operations and state management
  Supports text-based access codes and QR code generation
  
  Methods:
   - list(req, res): Get all events in a group
   - create(req, res): Create new event with access code
   - get(req, res): Get single event with details
   - update(req, res): Update event details
   - delete(req, res): Delete event
   - changeState(req, res): Toggle OPEN/CLOSED state for check-ins
 /

/
  List events in a group
  
  URL params:
   - groupId: UUID
  
  Query params:
   - state: string (optional, 'OPEN' or 'CLOSED')
   - page: number (optional, default )
   - limit: number (optional, default , max )
  
  Response:
   - : List of events
   - : Unauthorized
   - : Group not found
   - : Server error
 /
exports.list = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;
    const { state, page = , limit =  } = req.query;

    if (!userId) {
      return res.status().json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!groupId) {
      return res.status().json({
        status: 'error',
        message: 'Group ID is required',
      });
    }

    // Verify group exists and belongs to user
    const group = await EventGroup.findOne({
      where: { id: groupId, created_by: userId },
    });

    if (!group) {
      return res.status().json({
        status: 'error',
        message: 'Event group not found',
      });
    }

    // Validate pagination
    const pageNum = Math.max(, parseInt(page) || );
    const limitNum = Math.min(, Math.max(, parseInt(limit) || ));
    const offset = (pageNum - )  limitNum;

    // Build where clause
    const where = { group_id: groupId };
    if (state && ['OPEN', 'CLOSED'].includes(state)) {
      where.state = state;
    }

    // Fetch events
    const { count, rows } = await Event.findAndCountAll({
      where,
      attributes: ['id', 'title', 'start_time', 'duration_minutes', 'state'],
      order: [['start_time', 'ASC']],
      limit: limitNum,
      offset,
    });

    res.status().json({
      status: 'success',
      message: 'Events retrieved successfully',
      data: {
        events: rows,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(count / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('List events error:', error);
    res.status().json({
      status: 'error',
      message: 'Failed to retrieve events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/
  Create new event
  
  URL params:
   - groupId: UUID
  
  Request body:
   - title: string (required, - chars)
   - start_time: ISO string (required)
   - duration_minutes: number (required, -)
   - code_text: string (optional, auto-generated if not provided)
  
  Response:
   - : Event created with access code
   - : Validation error
   - : Unauthorized
   - : Duplicate access code
   - : Server error
 /
exports.create = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;
    const { title, start_time, duration_minutes, code_text } = req.body;

    if (!userId) {
      return res.status().json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!groupId) {
      return res.status().json({
        status: 'error',
        message: 'Group ID is required',
      });
    }

    // Verify group exists and belongs to user
    const group = await EventGroup.findOne({
      where: { id: groupId, created_by: userId },
    });

    if (!group) {
      return res.status().json({
        status: 'error',
        message: 'Event group not found',
      });
    }

    // Validation
    if (!title || title.trim().length === ) {
      return res.status().json({
        status: 'error',
        message: 'Event title is required',
      });
    }

    if (title.length > ) {
      return res.status().json({
        status: 'error',
        message: 'Title must be  characters or less',
      });
    }

    if (!start_time) {
      return res.status().json({
        status: 'error',
        message: 'Start time is required',
      });
    }

    const startDate = new Date(start_time);
    if (isNaN(startDate.getTime())) {
      return res.status().json({
        status: 'error',
        message: 'Invalid start time format',
      });
    }

    if (startDate < new Date()) {
      return res.status().json({
        status: 'error',
        message: 'Start time must be in the future',
      });
    }

    if (!duration_minutes || duration_minutes <  || duration_minutes > ) {
      return res.status().json({
        status: 'error',
        message: 'Duration must be between  and  minutes',
      });
    }

    // Generate or validate access code
    let accessCode = code_text;
    if (!accessCode) {
      accessCode = Math.random().toString().substring(, ).toUpperCase();
    }

    accessCode = accessCode.trim().toUpperCase();
    if (accessCode.length <  || accessCode.length > ) {
      return res.status().json({
        status: 'error',
        message: 'Access code must be - characters',
      });
    }

    // Check if code already exists
    const existingEvent = await Event.findOne({ where: { code_text: accessCode } });
    if (existingEvent) {
      return res.status().json({
        status: 'error',
        message: 'Access code already in use',
      });
    }

    // Create event
    const event = await Event.create({
      group_id: groupId,
      title: title.trim(),
      start_time: startDate,
      duration_minutes,
      code_text: accessCode,
      state: 'OPEN',
      created_by: userId,
    });

    res.status().json({
      status: 'success',
      message: 'Event created successfully',
      data: {
        id: event.id,
        title: event.title,
        start_time: event.start_time,
        duration_minutes: event.duration_minutes,
        code_text: event.code_text,
        state: event.state,
      },
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status().json({
      status: 'error',
      message: 'Failed to create event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/
  Get single event details
  
  URL params:
   - eventId: UUID
  
  Response:
   - : Event details with check-in count
   - : Unauthorized
   - : Event not found
   - : Server error
 /
exports.get = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;

    if (!userId) {
      return res.status().json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!eventId) {
      return res.status().json({
        status: 'error',
        message: 'Event ID is required',
      });
    }

    // Fetch event with creator verification
    const event = await Event.findOne({
      where: { id: eventId, created_by: userId },
      include: [
        {
          association: 'group',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!event) {
      return res.status().json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Count check-ins
    const checkInCount = await Attendance.count({
      where: { event_id: eventId },
    });

    res.status().json({
      status: 'success',
      message: 'Event retrieved successfully',
      data: {
        ...event.dataValues,
        check_in_count: checkInCount,
      },
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status().json({
      status: 'error',
      message: 'Failed to retrieve event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/
  Update event details
  
  URL params:
   - eventId: UUID
  
  Request body:
   - title: string (optional)
   - start_time: ISO string (optional)
   - duration_minutes: number (optional)
  
  Response:
   - : Event updated
   - : Validation error
   - : Unauthorized
   - : Event not found
   - : Server error
 /
exports.update = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;
    const { title, start_time, duration_minutes } = req.body;

    if (!userId) {
      return res.status().json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!eventId) {
      return res.status().json({
        status: 'error',
        message: 'Event ID is required',
      });
    }

    if (!title && !start_time && !duration_minutes) {
      return res.status().json({
        status: 'error',
        message: 'At least one field is required for update',
      });
    }

    // Find event
    const event = await Event.findOne({
      where: { id: eventId, created_by: userId },
    });

    if (!event) {
      return res.status().json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Validation and update
    if (title) {
      if (title.trim().length === ) {
        return res.status().json({
          status: 'error',
          message: 'Title cannot be empty',
        });
      }
      if (title.length > ) {
        return res.status().json({
          status: 'error',
          message: 'Title must be  characters or less',
        });
      }
      event.title = title.trim();
    }

    if (start_time) {
      const startDate = new Date(start_time);
      if (isNaN(startDate.getTime())) {
        return res.status().json({
          status: 'error',
          message: 'Invalid start time format',
        });
      }
      event.start_time = startDate;
    }

    if (duration_minutes) {
      if (duration_minutes <  || duration_minutes > ) {
        return res.status().json({
          status: 'error',
          message: 'Duration must be between  and  minutes',
        });
      }
      event.duration_minutes = duration_minutes;
    }

    await event.save();

    res.status().json({
      status: 'success',
      message: 'Event updated successfully',
      data: {
        id: event.id,
        title: event.title,
        start_time: event.start_time,
        duration_minutes: event.duration_minutes,
        state: event.state,
      },
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status().json({
      status: 'error',
      message: 'Failed to update event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/
  Delete event
  Warning: Deletes all attendance records
  
  URL params:
   - eventId: UUID
  
  Response:
   - : Event deleted
   - : Unauthorized
   - : Event not found
   - : Server error
 /
exports.delete = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;

    if (!userId) {
      return res.status().json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!eventId) {
      return res.status().json({
        status: 'error',
        message: 'Event ID is required',
      });
    }

    // Find and delete event
    const event = await Event.findOne({
      where: { id: eventId, created_by: userId },
    });

    if (!event) {
      return res.status().json({
        status: 'error',
        message: 'Event not found',
      });
    }

    await event.destroy();

    res.status().json({
      status: 'success',
      message: 'Event deleted successfully',
      data: { id: eventId },
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status().json({
      status: 'error',
      message: 'Failed to delete event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/
  Change event state (OPEN  CLOSED)
  
  URL params:
   - eventId: UUID
  
  Request body:
   - state: string ('OPEN' or 'CLOSED')
  
  Response:
   - : State changed
   - : Validation error
   - : Unauthorized
   - : Event not found
   - : Server error
 /
exports.changeState = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;
    const { state } = req.body;

    if (!userId) {
      return res.status().json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!eventId) {
      return res.status().json({
        status: 'error',
        message: 'Event ID is required',
      });
    }

    if (!state || !['OPEN', 'CLOSED'].includes(state)) {
      return res.status().json({
        status: 'error',
        message: 'State must be OPEN or CLOSED',
      });
    }

    // Find event
    const event = await Event.findOne({
      where: { id: eventId, created_by: userId },
    });

    if (!event) {
      return res.status().json({
        status: 'error',
        message: 'Event not found',
      });
    }

    event.state = state;
    await event.save();

    res.status().json({
      status: 'success',
      message: `Event state changed to ${state}`,
      data: {
        id: event.id,
        state: event.state,
      },
    });
  } catch (error) {
    console.error('Change state error:', error);
    res.status().json({
      status: 'error',
      message: 'Failed to change event state',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
