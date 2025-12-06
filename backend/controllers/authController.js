'use strict';

const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { User } = require('../models');

/**
 * Authentication Controller
 * Handles user registration, login, and JWT token management
 * 
 * Methods:
 *  - register(req, res): Create new user account with email/password
 *  - login(req, res): Authenticate user and return JWT token
 *  - logout(req, res): Invalidate user session (JWT blacklist)
 *  - refreshToken(req, res): Refresh JWT token
 */

/**
 * Register a new user
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
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required',
      });
    }

    if (name.length > 255) {
      return res.status(400).json({
        status: 'error',
        message: 'Name must be 255 characters or less',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered',
      });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const password_hash = await bcryptjs.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password_hash,
      role: role || 'PARTICIPANT',
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Login user
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
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format',
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isValidPassword = await bcryptjs.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Logout user
 * 
 * Note: In JWT-based auth, logout is typically handled client-side (discard token)
 * This endpoint can be used to blacklist tokens in production (optional)
 * 
 * Response:
 *  - 200: Logged out successfully
 */
exports.logout = async (req, res) => {
  try {
    // In a production app, you would blacklist the token here
    // For now, we just confirm logout on client side
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed',
    });
  }
};

/**
 * Refresh JWT token
 * 
 * Headers:
 *  - Authorization: Bearer {token} (required)
 * 
 * Response:
 *  - 200: New token generated
 *  - 401: Invalid or expired token
 *  - 500: Server error
 */
exports.refreshToken = async (req, res) => {
  try {
    // Extract token from header (done by auth middleware)
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;

    if (!userId || !userEmail) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token',
      });
    }

    // Generate new token
    const token = jwt.sign(
      { id: userId, email: userEmail, role: userRole },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed',
      data: { token },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Token refresh failed',
    });
  }
};
