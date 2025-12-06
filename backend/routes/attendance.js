'use strict';

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

/
  Attendance Routes
  Base: /api/attendance
  
  Check-in Routes (PUBLIC, no auth required):
   POST   /check-in/text              - Text code-based check-in
   POST   /check-in/qr                - QR code-based check-in
  
  Attendance Management Routes (Require JWT Auth - Event Creator Only):
   GET    /events/:eventId            - List attendees for event
   GET    /events/:eventId/stats      - Get attendance statistics
   GET    /events/:eventId/export/csv - Export to CSV
   GET    /events/:eventId/export/xlsx- Export to XLSX
 /

// ==================== PUBLIC CHECK-IN ROUTES ====================

/
  POST /api/attendance/check-in/text
  Text code-based check-in (PUBLIC)
  No authentication required
  
  Request body:
   - code: string (required, event access code)
   - name: string (optional, participant name for anonymous check-in)
   - email: string (optional, participant email)
  
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
  
  Anonymous check-in:
   POST /api/attendance/check-in/text
   {
     "code": "ABC",
     "name": "John Doe",
     "email": "john@example.com"
   }
 /
router.post('/check-in/text', attendanceController.checkInByText);

/
  POST /api/attendance/check-in/qr
  QR code-based check-in (PUBLIC)
  No authentication required
  QR code should contain the event access code
  
  Request body:
   - qr_data: string (required, QR code data/content)
  
  Response:
   - : Check-in recorded
   - : Invalid QR data
   - : Event not found
   - : Already checked in
   - : Server error
  
  Example:
   POST /api/attendance/check-in/qr
   {
     "qr_data": "ABC"
   }
 /
router.post('/check-in/qr', attendanceController.checkInByQR);

// ==================== PROTECTED ATTENDANCE ROUTES ====================

/
  GET /api/attendance/events/:eventId
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
   - : List of attendees with pagination
   - : Unauthorized
   - : Event not found
   - : Server error
  
  Example:
   GET /api/attendance/events/e-eb-d-a-?page=&limit=&sort=latest
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
  
  Response format:
   {
     "status": "success",
     "message": "Attendees retrieved successfully",
     "data": {
       "attendees": [
         {
           "id": "...",
           "event_id": "...",
           "participant_id": "...",
           "timestamp": "--T::Z",
           "participant": {
             "name": "John Doe",
             "email": "john@example.com"
           }
         }
       ],
       "pagination": {
         "total": ,
         "page": ,
         "limit": ,
         "pages": 
       }
     }
   }
 /
router.get('/events/:eventId', authMiddleware, attendanceController.list);

/
  GET /api/attendance/events/:eventId/stats
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
   GET /api/attendance/events/e-eb-d-a-/stats
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
  
  Response format:
   {
     "status": "success",
     "message": "Attendance statistics retrieved successfully",
     "data": {
       "event": {
         "id": "...",
         "title": "Morning Keynote",
         "state": "CLOSED"
       },
       "statistics": {
         "total_check_ins": ,
         "registered_check_ins": ,
         "anonymous_check_ins": ,
         "check_in_rate": ".%"
       }
     }
   }
 /
router.get('/events/:eventId/stats', authMiddleware, attendanceController.getStats);

/
  GET /api/attendance/events/:eventId/export/csv
  Export attendance as CSV file
  Only event creator can access
  
  URL params:
   - eventId: UUID (required)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : CSV file with columns:
     - Check-in ID
     - Participant Name
     - Participant Email
     - Check-in Time
     - Check-in Timestamp
   - : Unauthorized
   - : Event not found
   - : Server error
  
  Example:
   GET /api/attendance/events/e-eb-d-a-/export/csv
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
 /
router.get('/events/:eventId/export/csv', authMiddleware, attendanceController.exportCSV);

/
  GET /api/attendance/events/:eventId/export/xlsx
  Export attendance as XLSX file
  Only event creator can access
  Currently returns CSV as fallback until exceljs is implemented
  
  URL params:
   - eventId: UUID (required)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : XLSX file (or CSV as fallback)
   - : Unauthorized
   - : Event not found
   - : Server error
  
  Example:
   GET /api/attendance/events/e-eb-d-a-/export/xlsx
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
 /
router.get('/events/:eventId/export/xlsx', authMiddleware, attendanceController.exportXLSX);

module.exports = router;
