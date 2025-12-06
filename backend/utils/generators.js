/**
 * Generators Utility
 * Generate random/unique values
 * 
 * Functions:
 *  - generateAccessCode(): Generate 10-char alphanumeric code
 *  - generateUUID(): Generate UUID v4
 *  - generateRandomString(length): Generate random string
 *  - generateHash(data): Generate hash of data
 */

const crypto = require('crypto');

exports.generateAccessCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

exports.generateUUID = () => {
  return require('crypto').randomUUID();
};

exports.generateRandomString = (length = 16) => {
  return crypto.randomBytes(length).toString('hex');
};

exports.generateHash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};
