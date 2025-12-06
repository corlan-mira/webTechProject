/
  Environment Configuration
  Application-wide environment settings
 /

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || ,
  
  // API Configuration
  API_VERSION: process.env.API_VERSION || 'v',
  API_PREFIX: process.env.API_PREFIX || '/api',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRY: process.env.JWT_EXPIRY || 'h',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || 'd',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:',
  
  // External Services
  QR_SERVER_URL: process.env.QR_SERVER_URL || 'https://api.qrserver.com/v',
  QR_CODE_SIZE: process.env.QR_CODE_SIZE || 'x',
  
  // File Upload
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || , // MB
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Email Configuration (for Phase )
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  
  // Application Features
  ENABLE_QR_SCANNING: process.env.ENABLE_QR_SCANNING === 'true',
  ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
};
