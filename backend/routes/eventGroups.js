'use strict';

const express = require('express');
const router = express.Router();
const eventGroupController = require('../controllers/eventGroupController');
const authMiddleware = require('../middleware/authMiddleware');

/
  Event Group Routes
  Base: /api/event-groups
  All routes require JWT authentication
  Restricted to Event Organizer (EO) role
  
  GET    /               - List all event groups for authenticated user
  POST   /               - Create new event group
  GET    /:groupId       - Get single event group with all events
  PUT    /:groupId       - Update event group details
  DELETE /:groupId       - Delete event group and all associated events
 /

/
  GET /api/event-groups
  List all event groups for authenticated user
  
  Query params:
   - page: number (optional, default )
   - limit: number (optional, default , max )
   - search: string (optional, search by group name)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : List of event groups
   - : Unauthorized
   - : Server error
  
  Example:
   GET /api/event-groups?page=&limit=&search=conference
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
 /
router.get('/', authMiddleware, eventGroupController.list);

/
  POST /api/event-groups
  Create new event group
  
  Request body:
   - name: string (required, - chars)
   - description: string (optional, max  chars)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : Group created
   - : Validation error
   - : Unauthorized
   - : Server error
  
  Example:
   POST /api/event-groups
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
   {
     "name": "Tech Conference ",
     "description": "Annual technology conference for industry professionals"
   }
 /
router.post('/', authMiddleware, eventGroupController.create);

/
  GET /api/event-groups/:groupId
  Get single event group with all associated events
  
  URL params:
   - groupId: UUID (required)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : Event group with events
   - : Unauthorized
   - : Group not found
   - : Server error
  
  Example:
   GET /api/event-groups/e-eb-d-a-
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
 /
router.get('/:groupId', authMiddleware, eventGroupController.get);

/
  PUT /api/event-groups/:groupId
  Update event group details
  
  URL params:
   - groupId: UUID (required)
  
  Request body:
   - name: string (optional, - chars)
   - description: string (optional, max  chars)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : Group updated
   - : Validation error
   - : Unauthorized
   - : Group not found
   - : Server error
  
  Example:
   PUT /api/event-groups/e-eb-d-a-
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
   {
     "name": "Tech Conference  - Updated"
   }
 /
router.put('/:groupId', authMiddleware, eventGroupController.update);

/
  DELETE /api/event-groups/:groupId
  Delete event group and all associated events
  
  WARNING: This will cascade delete:
   - All events in the group
   - All attendance records for those events
  
  URL params:
   - groupId: UUID (required)
  
  Headers:
   - Authorization: Bearer {token} (required)
  
  Response:
   - : Group deleted
   - : Unauthorized
   - : Group not found
   - : Server error
  
  Example:
   DELETE /api/event-groups/e-eb-d-a-
   Headers: Authorization: Bearer eyJhbGciOiJIUzINiIs...
 /
router.delete('/:groupId', authMiddleware, eventGroupController.delete);

module.exports = router;
