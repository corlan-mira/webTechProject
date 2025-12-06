'use strict';

const express = require('express');
const router = express.Router();
const eventGroupController = require('../controllers/eventGroupController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Event Group Routes
 * Base: /api/event-groups
 * All routes require JWT authentication
 * Restricted to Event Organizer (EO) role
 * 
 * GET    /               - List all event groups for authenticated user
 * POST   /               - Create new event group
 * GET    /:groupId       - Get single event group with all events
 * PUT    /:groupId       - Update event group details
 * DELETE /:groupId       - Delete event group and all associated events
 */

/**
 * GET /api/event-groups
 * List all event groups for authenticated user
 * 
 * Query params:
 *  - page: number (optional, default 1)
 *  - limit: number (optional, default 10, max 100)
 *  - search: string (optional, search by group name)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: List of event groups
 *  - 401: Unauthorized
 *  - 500: Server error
 * 
 * Example:
 *  GET /api/event-groups?page=1&limit=10&search=conference
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get('/', authMiddleware, eventGroupController.list);

/**
 * POST /api/event-groups
 * Create new event group
 * 
 * Request body:
 *  - name: string (required, 1-255 chars)
 *  - description: string (optional, max 5000 chars)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 201: Group created
 *  - 400: Validation error
 *  - 401: Unauthorized
 *  - 500: Server error
 * 
 * Example:
 *  POST /api/event-groups
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *  {
 *    "name": "Tech Conference 2025",
 *    "description": "Annual technology conference for industry professionals"
 *  }
 */
router.post('/', authMiddleware, eventGroupController.create);

/**
 * GET /api/event-groups/:groupId
 * Get single event group with all associated events
 * 
 * URL params:
 *  - groupId: UUID (required)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: Event group with events
 *  - 401: Unauthorized
 *  - 404: Group not found
 *  - 500: Server error
 * 
 * Example:
 *  GET /api/event-groups/550e8400-e29b-41d4-a716-446655440000
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get('/:groupId', authMiddleware, eventGroupController.get);

/**
 * PUT /api/event-groups/:groupId
 * Update event group details
 * 
 * URL params:
 *  - groupId: UUID (required)
 * 
 * Request body:
 *  - name: string (optional, 1-255 chars)
 *  - description: string (optional, max 5000 chars)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: Group updated
 *  - 400: Validation error
 *  - 401: Unauthorized
 *  - 404: Group not found
 *  - 500: Server error
 * 
 * Example:
 *  PUT /api/event-groups/550e8400-e29b-41d4-a716-446655440000
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *  {
 *    "name": "Tech Conference 2025 - Updated"
 *  }
 */
router.put('/:groupId', authMiddleware, eventGroupController.update);

/**
 * DELETE /api/event-groups/:groupId
 * Delete event group and all associated events
 * 
 * WARNING: This will cascade delete:
 *  - All events in the group
 *  - All attendance records for those events
 * 
 * URL params:
 *  - groupId: UUID (required)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: Group deleted
 *  - 401: Unauthorized
 *  - 404: Group not found
 *  - 500: Server error
 * 
 * Example:
 *  DELETE /api/event-groups/550e8400-e29b-41d4-a716-446655440000
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.delete('/:groupId', authMiddleware, eventGroupController.delete);

module.exports = router;
