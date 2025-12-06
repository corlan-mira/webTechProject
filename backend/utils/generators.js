/
  Generators Utility
  Generate random/unique values
  
  Functions:
   - generateAccessCode(): Generate -char alphanumeric code
   - generateUUID(): Generate UUID v
   - generateRandomString(length): Generate random string
   - generateHash(data): Generate hash of data
 /

const crypto = require('crypto');

exports.generateAccessCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = ; i < ; i++) {
    code += chars.charAt(Math.floor(Math.random()  chars.length));
  }
  return code;
};

exports.generateUUID = () => {
  return require('crypto').randomUUID();
};

exports.generateRandomString = (length = ) => {
  return crypto.randomBytes(length).toString('hex');
};

exports.generateHash = (data) => {
  return crypto.createHash('sha').update(data).digest('hex');
};
