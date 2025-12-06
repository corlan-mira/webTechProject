'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const eventController = require('../controllers/eventController');
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Event Routes
 * Base: /api/events (with optional mergeParams for /api/event-groups/:groupId/events)
 * 
 * Event Management Routes (Require JWT Auth):
 *  GET    /                    - List events in group or all user events
 *  POST   /                    - Create new event
 *  GET    /:eventId            - Get single event details
 *  PUT    /:eventId            - Update event details
 *  DELETE /:eventId            - Delete event
 *  PATCH  /:eventId/state      - Change event state (OPEN/CLOSED)
 * 
 * Check-in Routes (Public, no auth required):
 *  POST   /:eventId/check-in/text  - Text code-based check-in
 *  POST   /:eventId/check-in/qr    - QR code-based check-in
 * 
 * Attendance Routes (Require JWT Auth - Event Creator Only):
 *  GET    /:eventId/attendance              - List attendees
 *  GET    /:eventId/attendance/stats        - Get attendance statistics
 *  GET    /:eventId/attendance/export/csv   - Export to CSV
 *  GET    /:eventId/attendance/export/xlsx  - Export to XLSX
 */

// ==================== EVENT MANAGEMENT ROUTES ====================

/**
 * GET /api/events
 * OR GET /api/event-groups/:groupId/events
 * List events in group or all user events
 * 
 * Query params:
 *  - page: number (optional, default 1)
 *  - limit: number (optional, default 10, max 50)
 *  - state: string (optional, filter by 'DRAFT', 'OPEN', 'CLOSED')
 *  - sort: string (optional, 'newest' or 'oldest', default 'newest')
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: List of events
 *  - 401: Unauthorized
 *  - 404: Group not found (if groupId provided)
 *  - 500: Server error
 * 
 * Example:
 *  GET /api/events?page=1&limit=10&state=OPEN
 *  GET /api/event-groups/550e8400-e29b-41d4-a716-446655440000/events
 */
router.get('/', authMiddleware, eventController.list);

/**
 * POST /api/events
 * OR POST /api/event-groups/:groupId/events
 * Create new event
 * 
 * Request body:
 *  - title: string (required, 1-255 chars)
 *  - start_time: ISO 8601 string (required, future date)
 *  - duration_minutes: number (required, 1-1440 minutes)
 *  - code_text: string (optional, 4-50 chars, auto-generated if not provided)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 201: Event created
 *  - 400: Validation error
 *  - 401: Unauthorized
 *  - 404: Group not found (if groupId provided)
 *  - 409: Access code already in use
 *  - 500: Server error
 * 
 * Example:
 *  POST /api/event-groups/550e8400-e29b-41d4-a716-446655440000/events
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *  {
 *    "title": "Morning Keynote Session",
 *    "start_time": "2025-12-15T09:00:00Z",
 *    "duration_minutes": 60
 *  }
 */
router.post('/', authMiddleware, eventController.create);

/**
 * GET /api/events/:eventId
 * Get single event details with check-in count
 * 
 * URL params:
 *  - eventId: UUID (required)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: Event details
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 * 
 * Example:
 *  GET /api/events/550e8400-e29b-41d4-a716-446655440000
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get('/:eventId', authMiddleware, eventController.get);

/**
 * PUT /api/events/:eventId
 * Update event details
 * Cannot update state or access codes through this endpoint
 * 
 * URL params:
 *  - eventId: UUID (required)
 * 
 * Request body:
 *  - title: string (optional)
 *  - start_time: ISO 8601 string (optional)
 *  - duration_minutes: number (optional)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: Event updated
 *  - 400: Validation error
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 * 
 * Example:
 *  PUT /api/events/550e8400-e29b-41d4-a716-446655440000
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *  {
 *    "title": "Updated Keynote Session",
 *    "duration_minutes": 90
 *  }
 */
router.put('/:eventId', authMiddleware, eventController.update);

/**
 * DELETE /api/events/:eventId
 * Delete event (only draft events)
 * 
 * URL params:
 *  - eventId: UUID (required)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: Event deleted
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 409: Cannot delete non-draft event
 *  - 500: Server error
 * 
 * Example:
 *  DELETE /api/events/550e8400-e29b-41d4-a716-446655440000
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.delete('/:eventId', authMiddleware, eventController.delete);

/**
 * PATCH /api/events/:eventId/state
 * Change event state (DRAFT → OPEN → CLOSED)
 * 
 * URL params:
 *  - eventId: UUID (required)
 * 
 * Request body:
 *  - state: string (required, 'OPEN' or 'CLOSED')
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: State changed
 *  - 400: Validation error
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 409: Invalid state transition
 *  - 500: Server error
 * 
 * Example:
 *  PATCH /api/events/550e8400-e29b-41d4-a716-446655440000/state
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *  {
 *    "state": "OPEN"
 *  }
 */
router.patch('/:eventId/state', authMiddleware, eventController.changeState);

// ==================== CHECK-IN ROUTES (PUBLIC) ====================

/**
 * POST /api/events/:eventId/check-in/text
 * Text code-based check-in (PUBLIC)
 * No authentication required
 * 
 * URL params:
 *  - eventId: UUID (required)
 * 
 * Request body:
 *  - code: string (required, event access code)
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
 */
router.post('/check-in/text', attendanceController.checkInByText);

/**
 * POST /api/events/:eventId/check-in/qr
 * QR code-based check-in (PUBLIC)
 * No authentication required
 * 
 * URL params:
 *  - eventId: UUID (required)
 * 
 * Request body:
 *  - qr_data: string (required, QR code data)
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
 *    "qr_data": "550e8400-e29b-41d4-a716-446655440000"
 *  }
 */
router.post('/check-in/qr', attendanceController.checkInByQR);

// ==================== ATTENDANCE ROUTES ====================

/**
 * GET /api/events/:eventId/attendance
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
 *  - 200: List of attendees
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 * 
 * Example:
 *  GET /api/events/550e8400-e29b-41d4-a716-446655440000/attendance?page=1&limit=20
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get('/:eventId/attendance', authMiddleware, attendanceController.list);

/**
 * GET /api/events/:eventId/attendance/stats
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
 *  GET /api/events/550e8400-e29b-41d4-a716-446655440000/attendance/stats
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get('/:eventId/attendance/stats', authMiddleware, attendanceController.getStats);

/**
 * GET /api/events/:eventId/attendance/export/csv
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
 *  - 200: CSV file
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 * 
 * Example:
 *  GET /api/events/550e8400-e29b-41d4-a716-446655440000/attendance/export/csv
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get('/:eventId/attendance/export/csv', authMiddleware, attendanceController.exportCSV);

/**
 * GET /api/events/:eventId/attendance/export/xlsx
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
 *  - 200: XLSX/CSV file
 *  - 401: Unauthorized
 *  - 404: Event not found
 *  - 500: Server error
 * 
 * Example:
 *  GET /api/events/550e8400-e29b-41d4-a716-446655440000/attendance/export/xlsx
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get('/:eventId/attendance/export/xlsx', authMiddleware, attendanceController.exportXLSX);

module.exports = router;
