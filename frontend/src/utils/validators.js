import { VALIDATION_PATTERNS } from './constants';

/**
 * Validate email format
 */
export const validateEmail = (email) => {
    return VALIDATION_PATTERNS.EMAIL.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
    if (!password || password.length < VALIDATION_PATTERNS.PASSWORD_MIN_LENGTH) {
        return {
            valid: false,
            message: `Password must be at least ${VALIDATION_PATTERNS.PASSWORD_MIN_LENGTH} characters long`
        };
    }
    return { valid: true, message: '' };
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName) => {
    if (!value || value.trim() === '') {
        return {
            valid: false,
            message: `${fieldName} is required`
        };
    }
    return { valid: true, message: '' };
};

/**
 * Validate access code format
 */
export const validateAccessCode = (code) => {
    if (!code || code.trim() === '') {
        return {
            valid: false,
            message: 'Access code is required'
        };
    }
    return { valid: true, message: '' };
};
