/
  Constants Utility
  Application-wide constants
 /

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
    OK: ,
    CREATED: ,
    BAD_REQUEST: ,
    UNAUTHORIZED: ,
    FORBIDDEN: ,
    NOT_FOUND: ,
    CONFLICT: ,
    INTERNAL_ERROR: ,
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
    ACCESS_CODE_LENGTH: ,
    MAX_ATTENDEES: ,
    MAX_FILE_SIZE: , // MB
  },
};
