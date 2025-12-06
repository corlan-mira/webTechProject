/**
 * Validators Utility
 * Input validation helper functions
 * 
 * Functions:
 *  - isValidEmail(email): Check valid email format
 *  - isValidPassword(password): Check password strength
 *  - isValidAccessCode(code): Validate access code format
 *  - isValidUUID(uuid): Validate UUID format
 *  - isValidDateRange(startDate, endDate): Check dates valid
 */

exports.isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

exports.isValidPassword = (password) => {
  // Min 8 chars, at least one uppercase, one lowercase, one number
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
};

exports.isValidAccessCode = (code) => {
  return /^[A-Z0-9]{10}$/.test(code);
};

exports.isValidUUID = (uuid) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

exports.isValidDateRange = (startDate, endDate) => {
  return new Date(endDate) >= new Date(startDate);
};
