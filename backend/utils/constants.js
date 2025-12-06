/**
 * Constants Utility
 * Application-wide constants
 */

module.exports = {
  // Event States
  EVENT_STATE: {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
  },

  // Check-In Methods
  CHECK_IN_METHOD: {
    TEXT: 'TEXT',
    QR: 'QR',
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
  },

  // Messages
  MESSAGES: {
    SUCCESS: 'Operation successful',
    ERROR: 'An error occurred',
    UNAUTHORIZED: 'Unauthorized access',
    NOT_FOUND: 'Resource not found',
  },

  // Limits
  LIMITS: {
    ACCESS_CODE_LENGTH: 10,
    MAX_ATTENDEES: 10000,
    MAX_FILE_SIZE: 10485760, // 10MB
  },
};
