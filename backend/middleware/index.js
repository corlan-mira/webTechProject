/**
 * Middleware Index
 * Exports all middleware functions
 */

module.exports = {
  authMiddleware: require('./authMiddleware'),
  errorHandler: require('./errorHandler'),
  validation: require('./validation'),
  cors: require('./cors'),
  logging: require('./logging'),
};
