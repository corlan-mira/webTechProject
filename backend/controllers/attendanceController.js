'use strict';

const { Event, Attendance, User } = require('../models');
const { Parser } = require('json2csv');

/**
 * Attendance Controller
 * Handles check-in operations and attendance reporting
 * Supports both registered users and anonymous participants
 * 
 * Methods:
 *  - checkInByText(req, res): Text code-based check-in
 *  - checkInByQR(req, res): QR code-based check-in
 *  - list(req, res): Get attendees for event
 *  - exportCSV(req, res): Export attendance as CSV
 *  - exportXLSX(req, res): Export attendance as XLSX
 *  - getStats(req, res): Get attendance statistics
 */

/**
 * Check-in by text access code
 * Public endpoint (no auth required)
 * 
 * Request body:
 *  - code: string (required, event access code)
 *  - name: string (optional, participant name for anonymous check-in)
 *  - email: string (optional, participant email)
 * 
 * Response:
 *  - 201: Check-in recorded
 *  - 400: Validation error
 *  - 404: Event not found or invalid code
 *  - 409: Already checked in
 *  - 500: Server error
 */
exports.checkInByText = async (req, res) => {
  try {
    const { code, name, email } = req.body;
    const userId = req.user?.id; // Optional, from auth middleware

    // Validation
    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Event code is required',
      });
    }

    // Find event by access code
    const event = await Event.findOne({
      where: { code_text: code.trim().toUpperCase() },
    });

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid event code',
      });
    }

    // Check if event is open
    if (event.state === 'CLOSED') {
      return res.status(400).json({
        status: 'error',
        message: 'Event is not accepting check-ins',
      });
    }

    // Prevent duplicate check-ins (same user for same event)
    if (userId) {
      const existing = await Attendance.findOne({
        where: { event_id: event.id, participant_id: userId },
      });
      if (existing) {
        return res.status(409).json({
          status: 'error',
          message: 'You have already checked in to this event',
        });
      }
    }

    // Create attendance record
    const attendance = await Attendance.create({
      event_id: event.id,
      participant_id: userId || null, // Null for anonymous
      timestamp: new Date(),
    });

    res.status(201).json({
      status: 'success',
      message: 'Check-in successful',
      data: {
        id: attendance.id,
        event_id: event.id,
        event_title: event.title,
        timestamp: attendance.timestamp,
      },
    });
  } catch (error) {
    console.error('Check-in by text error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Check-in failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Check-in by QR code
 * Public endpoint (no auth required)
 * QR code contains encoded event access code
 * 
 * Request body:
 *  - qr_data: string (required, QR code data/content)
 * 
 * Response:
 *  - 201: Check-in recorded
 *  - 400: Invalid QR data
 *  - 404: Event not found
 *  - 409: Already checked in
 *  - 500: Server error
 */
exports.checkInByQR = async (req, res) => {
  try {
    const { qr_data } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!qr_data || qr_data.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'QR data is required',
      });
    }

    // Extract code from QR (assumes QR contains the access code)
    const code = qr_data.trim().toUpperCase();

    // Find event
    const event = await Event.findOne({
      where: { code_text: code },
    });

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid QR code or event not found',
      });
    }

    // Check if event is open
    if (event.state === 'CLOSED') {
      return res.status(400).json({
        status: 'error',
        message: 'Event is not accepting check-ins',
      });
    }

    // Prevent duplicate check-ins
    if (userId) {
      const existing = await Attendance.findOne({
        where: { event_id: event.id, participant_id: userId },
      });
      if (existing) {
        return res.status(409).json({
          status: 'error',
          message: 'You have already checked in to this event',
        });
      }
    }

    // Create attendance record
    const attendance = await Attendance.create({
      event_id: event.id,
      participant_id: userId || null,
      timestamp: new Date(),
    });

    res.status(201).json({
      status: 'success',
      message: 'QR check-in successful',
      data: {
        id: attendance.id,
        event_id: event.id,
        event_title: event.title,
        timestamp: attendance.timestamp,
      },
    });
  } catch (error) {
    console.error('Check-in by QR error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Check-in failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * List attendees for an event
 * 
 * URL params:
 *  - eventId: UUID
 * 
 * Query params:
 *  - page: number (optional, default 1)
 *  - limit: number (optional, default 20, max 100)
 *  - sort: string (optional, 'earliest' or 'latest', default 'latest')
 * 
 * Response:
 *  - 200: List of attendees
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 */
exports.list = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;
    const { page = 1, limit = 20, sort = 'latest' } = req.query;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!eventId) {
      return res.status(400).json({
        status: 'error',
        message: 'Event ID is required',
      });
    }

    // Verify event exists and belongs to user
    const event = await Event.findOne({
      where: { id: eventId, created_by: userId },
    });

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Determine sort order
    const sortOrder = sort === 'earliest' ? 'ASC' : 'DESC';

    // Fetch attendances
    const { count, rows } = await Attendance.findAndCountAll({
      where: { event_id: eventId },
      include: [
        {
          association: 'participant',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['timestamp', sortOrder]],
      limit: limitNum,
      offset,
    });

    res.status(200).json({
      status: 'success',
      message: 'Attendees retrieved successfully',
      data: {
        attendees: rows,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(count / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('List attendees error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve attendees',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Export attendees as CSV
 * 
 * URL params:
 *  - eventId: UUID
 * 
 * Response:
 *  - 200: CSV file
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 */
exports.exportCSV = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!eventId) {
      return res.status(400).json({
        status: 'error',
        message: 'Event ID is required',
      });
    }

    // Verify event exists and belongs to user
    const event = await Event.findOne({
      where: { id: eventId, created_by: userId },
    });

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Fetch all attendances
    const attendances = await Attendance.findAll({
      where: { event_id: eventId },
      include: [
        {
          association: 'participant',
          attributes: ['name', 'email'],
        },
      ],
      order: [['timestamp', 'ASC']],
      raw: true,
    });

    // Format data for CSV
    const csvData = attendances.map((a) => ({
      'Check-in ID': a.id,
      'Participant Name': a['participant.name'] || 'Anonymous',
      'Participant Email': a['participant.email'] || '-',
      'Check-in Time': new Date(a.timestamp).toLocaleString(),
      'Check-in Timestamp': a.timestamp,
    }));

    // Convert to CSV
    const parser = new Parser({
      fields: ['Check-in ID', 'Participant Name', 'Participant Email', 'Check-in Time', 'Check-in Timestamp'],
    });
    const csv = parser.parse(csvData);

    // Send CSV file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="attendance-${event.id}-${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export CSV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Export attendees as XLSX
 * 
 * URL params:
 *  - eventId: UUID
 * 
 * Response:
 *  - 200: XLSX file
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 */
exports.exportXLSX = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!eventId) {
      return res.status(400).json({
        status: 'error',
        message: 'Event ID is required',
      });
    }

    // Verify event exists and belongs to user
    const event = await Event.findOne({
      where: { id: eventId, created_by: userId },
    });

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Fetch all attendances
    const attendances = await Attendance.findAll({
      where: { event_id: eventId },
      include: [
        {
          association: 'participant',
          attributes: ['name', 'email'],
        },
      ],
      order: [['timestamp', 'ASC']],
      raw: true,
    });

    // Format data for XLSX
    const xlsxData = attendances.map((a) => ({
      'Check-in ID': a.id,
      'Participant Name': a['participant.name'] || 'Anonymous',
      'Participant Email': a['participant.email'] || '-',
      'Check-in Time': new Date(a.timestamp).toLocaleString(),
    }));

    // Install exceljs and implement
    // For now, return CSV as fallback
    const parser = new Parser({
      fields: ['Check-in ID', 'Participant Name', 'Participant Email', 'Check-in Time'],
    });
    const csv = parser.parse(xlsxData);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="attendance-${event.id}-${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Export XLSX error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export XLSX',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get attendance statistics for an event
 * 
 * URL params:
 *  - eventId: UUID
 * 
 * Response:
 *  - 200: Attendance statistics
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!eventId) {
      return res.status(400).json({
        status: 'error',
        message: 'Event ID is required',
      });
    }

    // Verify event exists and belongs to user
    const event = await Event.findOne({
      where: { id: eventId, created_by: userId },
    });

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Get statistics
    const totalCheckIns = await Attendance.count({
      where: { event_id: eventId },
    });

    const registeredCheckIns = await Attendance.count({
      where: { event_id: eventId, participant_id: { [require('sequelize').Op.not]: null } },
    });

    const anonymousCheckIns = totalCheckIns - registeredCheckIns;

    res.status(200).json({
      status: 'success',
      message: 'Attendance statistics retrieved successfully',
      data: {
        event: {
          id: event.id,
          title: event.title,
          state: event.state,
        },
        statistics: {
          total_check_ins: totalCheckIns,
          registered_check_ins: registeredCheckIns,
          anonymous_check_ins: anonymousCheckIns,
          check_in_rate: totalCheckIns > 0 ? ((registeredCheckIns / totalCheckIns) * 100).toFixed(2) + '%' : '0%',
        },
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
