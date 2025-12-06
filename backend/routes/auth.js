'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Authentication Routes
 * Base: /api/auth
 * 
 * All routes are PUBLIC (no JWT required) except refresh token
 * JWT token is returned in response and used for subsequent requests
 * 
 * POST   /register       - Register new user (public)
 * POST   /login          - Login user (public)
 * POST   /logout         - Logout user (public)
 * POST   /refresh        - Refresh JWT token (requires auth)
 */

/**
 * POST /api/auth/register
 * Register new user
 * 
 * Request body:
 *  - name: string (required, 1-255 chars)
 *  - email: string (required, valid email, unique)
 *  - password: string (required, min 8 chars)
 *  - role: string (optional, 'EO' or 'PARTICIPANT', default 'PARTICIPANT')
 * 
 * Response:
 *  - 201: User created with id, email, name, role, token
 *  - 400: Validation error
 *  - 409: Email already exists
 *  - 500: Server error
 * 
 * Example:
 *  POST /api/auth/register
 *  {
 *    "name": "John Doe",
 *    "email": "john@example.com",
 *    "password": "securePassword123",
 *    "role": "EO"
 *  }
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Authenticate user and get JWT token
 * 
 * Request body:
 *  - email: string (required, valid email)
 *  - password: string (required)
 * 
 * Response:
 *  - 200: Authenticated with token
 *  - 400: Missing credentials
 *  - 401: Invalid email or password
 *  - 500: Server error
 * 
 * Example:
 *  POST /api/auth/login
 *  {
 *    "email": "john@example.com",
 *    "password": "securePassword123"
 *  }
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/logout
 * Logout user (JWT invalidation on client-side)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (optional)
 * 
 * Response:
 *  - 200: Logged out successfully
 *  - 500: Server error
 * 
 * Note: Actual logout is handled client-side by discarding the JWT token
 * In production, you may implement token blacklisting in this endpoint
 */
router.post('/logout', authController.logout);

/**
 * POST /api/auth/refresh
 * Refresh JWT token (extends expiration)
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: New token generated
 *  - 401: Invalid or expired token
 *  - 500: Server error
 * 
 * Example:
 *  POST /api/auth/refresh
 *  Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.post('/refresh', authMiddleware, authController.refreshToken);

module.exports = router;
