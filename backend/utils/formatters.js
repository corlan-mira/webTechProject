/**
 * Formatters Utility
 * Data formatting helper functions
 * 
 * Functions:
 *  - formatDate(date): Format date to ISO string
 *  - formatResponse(data, message): Format API response
 *  - formatError(error): Format error response
 *  - formatAttendanceRecord(record): Format attendance data
 */

exports.formatDate = (date) => {
  return new Date(date).toISOString();
};

exports.formatResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

exports.formatError = (error) => {
  return {
    success: false,
    error: error.message || 'An error occurred',
    timestamp: new Date().toISOString(),
  };
};

exports.formatAttendanceRecord = (record) => {
  return {
    id: record.id,
    name: record.participant_name,
    email: record.participant_email,
    method: record.check_in_method,
    checkedInAt: record.checked_in_at,
  };
};
