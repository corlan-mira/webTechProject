'use strict';

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Attendance Routes
 * Base: /api/attendance
 * 
 * Check-in Routes (PUBLIC, no auth required):
 *  POST   /check-in/text              - Text code-based check-in
 *  POST   /check-in/qr                - QR code-based check-in
 * 
 * Attendance Management Routes (Require JWT Auth - Event Creator Only):
 *  GET    /events/:eventId            - List attendees for event
 *  GET    /events/:eventId/stats      - Get attendance statistics
 *  GET    /events/:eventId/export/csv - Export to CSV
 *  GET    /events/:eventId/export/xlsx- Export to XLSX
 */

// ==================== PUBLIC CHECK-IN ROUTES ====================

/**
 * POST /api/attendance/check-in/text
 * Text code-based check-in (PUBLIC)
 * No authentication required
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
 * 
 * Example:
 *  POST /api/attendance/check-in/text
 *  {
 *    "code": "ABC123"
 *  }
 * 
 * Anonymous check-in:
 *  POST /api/attendance/check-in/text
 *  {
 *    "code": "ABC123",
 *    "name": "John Doe",
 *    "email": "john@example.com"
 *  }
 */
router.post('/check-in/text', attendanceController.checkInByText);

/**
 * POST /api/attendance/check-in/qr
 * QR code-based check-in (PUBLIC)
 * No authentication required
 * QR code should contain the event access code
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
 * 
 * Example:
 *  POST /api/attendance/check-in/qr
 *  {
 *    "qr_data": "ABC123"
 *  }
 */
router.post('/check-in/qr', attendanceController.checkInByQR);

// ==================== PROTECTED ATTENDANCE ROUTES ====================

/**
 * GET /api/attendance/events/:eventId
 * List attendees for event (paginated)
 * Only event creator can access
 * 
 * URL params:
 *  - eventId: UUID (required)
 * 
 * Query params:
 *  - page: number (optional, default 1)
 *  - limit: number (optional, default 20, max 100)
 *  - sort: string (optional, 'earliest' or 'latest', default 'latest')
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: List of attendees with pagination
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 * 
 * Example:
 *  GET /api/attendance/events/550e8400-e29b-41d4-a716-446655440000?page=1&limit=20&sort=latest
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * 
 * Response format:
 *  {
 *    "status": "success",
 *    "message": "Attendees retrieved successfully",
 *    "data": {
 *      "attendees": [
 *        {
 *          "id": "...",
 *          "event_id": "...",
 *          "participant_id": "...",
 *          "timestamp": "2025-12-06T10:30:00Z",
 *          "participant": {
 *            "name": "John Doe",
 *            "email": "john@example.com"
 *          }
 *        }
 *      ],
 *      "pagination": {
 *        "total": 42,
 *        "page": 1,
 *        "limit": 20,
 *        "pages": 3
 *      }
 *    }
 *  }
 */
router.get('/events/:eventId', authMiddleware, attendanceController.list);

/**
 * GET /api/attendance/events/:eventId/stats
 * Get attendance statistics for event
 * Only event creator can access
 * 
 * URL params:
 *  - eventId: UUID (required)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: Attendance statistics
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 * 
 * Example:
 *  GET /api/attendance/events/550e8400-e29b-41d4-a716-446655440000/stats
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * 
 * Response format:
 *  {
 *    "status": "success",
 *    "message": "Attendance statistics retrieved successfully",
 *    "data": {
 *      "event": {
 *        "id": "...",
 *        "title": "Morning Keynote",
 *        "state": "CLOSED"
 *      },
 *      "statistics": {
 *        "total_check_ins": 42,
 *        "registered_check_ins": 35,
 *        "anonymous_check_ins": 7,
 *        "check_in_rate": "83.33%"
 *      }
 *    }
 *  }
 */
router.get('/events/:eventId/stats', authMiddleware, attendanceController.getStats);

/**
 * GET /api/attendance/events/:eventId/export/csv
 * Export attendance as CSV file
 * Only event creator can access
 * 
 * URL params:
 *  - eventId: UUID (required)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: CSV file with columns:
 *    - Check-in ID
 *    - Participant Name
 *    - Participant Email
 *    - Check-in Time
 *    - Check-in Timestamp
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 * 
 * Example:
 *  GET /api/attendance/events/550e8400-e29b-41d4-a716-446655440000/export/csv
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get('/events/:eventId/export/csv', authMiddleware, attendanceController.exportCSV);

/**
 * GET /api/attendance/events/:eventId/export/xlsx
 * Export attendance as XLSX file
 * Only event creator can access
 * Currently returns CSV as fallback until exceljs is implemented
 * 
 * URL params:
 *  - eventId: UUID (required)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: XLSX file (or CSV as fallback)
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 * 
 * Example:
 *  GET /api/attendance/events/550e8400-e29b-41d4-a716-446655440000/export/xlsx
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get('/events/:eventId/export/xlsx', authMiddleware, attendanceController.exportXLSX);

module.exports = router;
