'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const eventController = require('../controllers/eventController');
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

/
  Event Routes
  Base: /api/events (with optional mergeParams for /api/event-groups/:groupId/events)
  
  Event Management Routes (Require JWT Auth):
   GET    /                    - List events in group or all user events
   POST   /                    - Create new event
   GET    /:eventId            - Get single event details
   PUT    /:eventId            - Update event details
   DELETE /:eventId            - Delete event
   PATCH  /:eventId/state      - Change event state (OPEN/CLOSED)
  
  Check-in Routes (Public, no auth required):
   POST   /:eventId/check-in/text  - Text code-based check-in
   POST   /:eventId/check-in/qr    - QR code-based check-in
  
  Attendance Routes (Require JWT Auth - Event Creator Only):
   GET    /:eventId/attendance              - List attendees
   GET    /:eventId/attendance/stats        - Get attendance statistics
   GET    /:eventId/attendance/export/csv   - Export to CSV
   GET    /:eventId/attendance/export/xlsx  - Export to XLSX
 /

// ==================== EVENT MANAGEMENT ROUTES ====================

/
  GET /api/events
  OR GET /api/event-groups/:groupId/events
  List events in group or all user events
  
  Query params:
   - page: number (optional, default )
   - limit: number (optional, default , max )
   - state: string (optional, filter by 'DRAFT', 'OPEN', 'CLOSED')
   - sort: string (optional, 'newest' or 'oldest', default 'newest')
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : List of events
   - : Unauthorized
   - : Group not found (if groupId provided)
   - : Server error
  
  Example:
   GET /api/events?page=&limit=&state=OPEN
   GET /api/event-groups/e-eb-d-a-/events
 /
router.get('/', authMiddleware, eventController.list);

/
  POST /api/events
  OR POST /api/event-groups/:groupId/events
  Create new event
  
  Request body:
   - title: string (required, - chars)
   - start_time: ISO  string (required, future date)
   - duration_minutes: number (required, - minutes)
   - code_text: string (optional, - chars, auto-generated if not provided)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : Event created
   - : Validation error
   - : Unauthorized
   - : Group not found (if groupId provided)
   - : Access code already in use
   - : Server error
  
  Example:
   POST /api/event-groups/e-eb-d-a-/events
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
   {
     "title": "Morning Keynote Session",
     "start_time": "--T::Z",
     "duration_minutes": 
   }
 /
router.post('/', authMiddleware, eventController.create);

/
  GET /api/events/:eventId
  Get single event details with check-in count
  
  URL params:
   - eventId: UUID (required)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : Event details
   - : Unauthorized
   - : Event not found
   - : Server error
  
  Example:
   GET /api/events/e-eb-d-a-
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
 /
router.get('/:eventId', authMiddleware, eventController.get);

/
  PUT /api/events/:eventId
  Update event details
  Cannot update state or access codes through this endpoint
  
  URL params:
   - eventId: UUID (required)
  
  Request body:
   - title: string (optional)
   - start_time: ISO  string (optional)
   - duration_minutes: number (optional)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : Event updated
   - : Validation error
   - : Unauthorized
   - : Event not found
   - : Server error
  
  Example:
   PUT /api/events/e-eb-d-a-
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
   {
     "title": "Updated Keynote Session",
     "duration_minutes": 
   }
 /
router.put('/:eventId', authMiddleware, eventController.update);

/
  DELETE /api/events/:eventId
  Delete event (only draft events)
  
  URL params:
   - eventId: UUID (required)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : Event deleted
   - : Unauthorized
   - : Event not found
   - : Cannot delete non-draft event
   - : Server error
  
  Example:
   DELETE /api/events/e-eb-d-a-
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
 /
router.delete('/:eventId', authMiddleware, eventController.delete);

/
  PATCH /api/events/:eventId/state
  Change event state (DRAFT → OPEN → CLOSED)
  
  URL params:
   - eventId: UUID (required)
  
  Request body:
   - state: string (required, 'OPEN' or 'CLOSED')
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : State changed
   - : Validation error
   - : Unauthorized
   - : Event not found
   - : Invalid state transition
   - : Server error
  
  Example:
   PATCH /api/events/e-eb-d-a-/state
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
   {
     "state": "OPEN"
   }
 /
router.patch('/:eventId/state', authMiddleware, eventController.changeState);

// ==================== CHECK-IN ROUTES (PUBLIC) ====================

/
  POST /api/events/:eventId/check-in/text
  Text code-based check-in (PUBLIC)
  No authentication required
  
  URL params:
   - eventId: UUID (required)
  
  Request body:
   - code: string (required, event access code)
  
  Response:
   - : Check-in recorded
   - : Validation error
   - : Event not found or invalid code
   - : Already checked in
   - : Server error
  
  Example:
   POST /api/attendance/check-in/text
   {
     "code": "ABC"
   }
 /
router.post('/check-in/text', attendanceController.checkInByText);

/
  POST /api/events/:eventId/check-in/qr
  QR code-based check-in (PUBLIC)
  No authentication required
  
  URL params:
   - eventId: UUID (required)
  
  Request body:
   - qr_data: string (required, QR code data)
  
  Response:
   - : Check-in recorded
   - : Invalid QR data
   - : Event not found
   - : Already checked in
   - : Server error
  
  Example:
   POST /api/attendance/check-in/qr
   {
     "qr_data": "e-eb-d-a-"
   }
 /
router.post('/check-in/qr', attendanceController.checkInByQR);

// ==================== ATTENDANCE ROUTES ====================

/
  GET /api/events/:eventId/attendance
  List attendees for event (paginated)
  Only event creator can access
  
  URL params:
   - eventId: UUID (required)
  
  Query params:
   - page: number (optional, default )
   - limit: number (optional, default , max )
   - sort: string (optional, 'earliest' or 'latest', default 'latest')
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : List of attendees
   - : Unauthorized
   - : Event not found
   - : Server error
  
  Example:
   GET /api/events/e-eb-d-a-/attendance?page=&limit=
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
 /
router.get('/:eventId/attendance', authMiddleware, attendanceController.list);

/
  GET /api/events/:eventId/attendance/stats
  Get attendance statistics for event
  Only event creator can access
  
  URL params:
   - eventId: UUID (required)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : Attendance statistics
   - : Unauthorized
   - : Event not found
   - : Server error
  
  Example:
   GET /api/events/e-eb-d-a-/attendance/stats
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
 /
router.get('/:eventId/attendance/stats', authMiddleware, attendanceController.getStats);

/
  GET /api/events/:eventId/attendance/export/csv
  Export attendance as CSV file
  Only event creator can access
  
  URL params:
   - eventId: UUID (required)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : CSV file
   - : Unauthorized
   - : Event not found
   - : Server error
  
  Example:
   GET /api/events/e-eb-d-a-/attendance/export/csv
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
 /
router.get('/:eventId/attendance/export/csv', authMiddleware, attendanceController.exportCSV);

/
  GET /api/events/:eventId/attendance/export/xlsx
  Export attendance as XLSX file
  Only event creator can access
  Currently returns CSV as fallback until exceljs is implemented
  
  URL params:
   - eventId: UUID (required)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : XLSX/CSV file
   - : Unauthorized
   - : Event not found
   - : Server error
  
  Example:
   GET /api/events/e-eb-d-a-/attendance/export/xlsx
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
 /
router.get('/:eventId/attendance/export/xlsx', authMiddleware, attendanceController.exportXLSX);

module.exports = router;
