/
  CORS Middleware
  Configure Cross-Origin Resource Sharing
  
  Functions:
   - corsOptions(req, callback): Dynamic CORS configuration
 /

const { CORS_ORIGIN } = require('../config/environment');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [CORS_ORIGIN];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: ,
};

module.exports = corsOptions;
