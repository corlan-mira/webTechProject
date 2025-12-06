/
  Validators Utility
  Input validation helper functions
  
  Functions:
   - isValidEmail(email): Check valid email format
   - isValidPassword(password): Check password strength
   - isValidAccessCode(code): Validate access code format
   - isValidUUID(uuid): Validate UUID format
   - isValidDateRange(startDate, endDate): Check dates valid
 /

exports.isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

exports.isValidPassword = (password) => {
  // Min  chars, at least one uppercase, one lowercase, one number
  return password.length >=  && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[-]/.test(password);
};

exports.isValidAccessCode = (code) => {
  return /^[A-Z-]{}$/.test(code);
};

exports.isValidUUID = (uuid) => {
  const regex = /^[-a-f]{}-[-a-f]{}-[-a-f]{}-[-a-f]{}-[-a-f]{}$/i;
  return regex.test(uuid);
};

exports.isValidDateRange = (startDate, endDate) => {
  return new Date(endDate) >= new Date(startDate);
};
