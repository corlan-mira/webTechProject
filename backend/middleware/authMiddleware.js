/**
 * Auth Middleware
 * Verifies JWT tokens and protects routes
 * 
 * Functions:
 *  - verifyToken(req, res, next): Validate JWT token
 *  - verifyOwnership(req, res, next): Verify user owns resource
 */

const { JWT_SECRET } = require('../config/environment');

exports.verifyToken = (req, res, next) => {
  try {
    // Implementation: Verify JWT from Authorization header
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

exports.verifyOwnership = (req, res, next) => {
  try {
    // Implementation: Check user_id matches
    next();
  } catch (error) {
    res.status(403).json({ error: 'Forbidden' });
  }
};
