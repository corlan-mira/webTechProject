// API base URL constants
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Event states
export const EVENT_STATES = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED'
};

// Check-in methods
export const CHECK_IN_METHODS = {
    TEXT: 'TEXT',
    QR: 'QR'
};

// Local storage keys
export const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data'
};

// Date format
export const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// Validation patterns
export const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 6
};
