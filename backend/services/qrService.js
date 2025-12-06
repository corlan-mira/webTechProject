/
  QR Service
  Handles QR code generation via external QRServer API
  
  Functions:
   - generateQRCode(text, options): Generate QR code and return URL or base
   - getQRCodeURL(text, size): Get direct QR code URL from API
   - getQRCodeBase(text, size): Get QR code as base encoded string
   - validateQRText(text): Validate input text for QR generation
   - encodeQRData(text): Properly encode text for API URL
 /

const axios = require('axios');
const { QR_SERVER_URL, QR_CODE_SIZE } = require('../config/environment');

// Constants
const QR_API_ENDPOINT = 'create-qr-code';
const DEFAULT_SIZE = 'x';
const MAX_TEXT_LENGTH = ; // QR code limit for alphanumeric data

/
  Generate QR code from text string
  
  @param {string} text - Text to encode in QR code
  @param {Object} options - Configuration options
  @param {string} options.size - QR code size (format: "WIDTHxHEIGHT"), default: x
  @param {string} options.format - Output format: 'url' or 'base', default: 'url'
  @param {number} options.timeout - Request timeout in ms, default: 
  @returns {Promise<{success: boolean, data: string, format: string, error?: string}>}
  
  @example
  // Get QR code as URL
  const result = await generateQRCode('Hello World');
  // { success: true, data: 'https://api.qrserver.com/v/create-qr-code/?size=x&data=Hello%World', format: 'url' }
  
  @example
  // Get QR code as base
  const result = await generateQRCode('Hello World', { format: 'base' });
  // { success: true, data: 'data:image/png;base,...', format: 'base' }
 /
exports.generateQRCode = async (text, options = {}) => {
  try {
    // Validate input text
    const validationError = validateQRText(text);
    if (validationError) {
      return {
        success: false,
        data: null,
        format: null,
        error: validationError
      };
    }

    // Extract and validate options
    const size = options.size || QR_CODE_SIZE || DEFAULT_SIZE;
    const format = options.format || 'url';
    const timeout = options.timeout || ;

    // Validate size format
    if (!validateQRSize(size)) {
      return {
        success: false,
        data: null,
        format: null,
        error: `Invalid QR size format. Expected 'WIDTHxHEIGHT' (e.g., 'x'), got: ${size}`
      };
    }

    // Validate format
    if (!['url', 'base'].includes(format)) {
      return {
        success: false,
        data: null,
        format: null,
        error: `Invalid format. Must be 'url' or 'base', got: ${format}`
      };
    }

    // Encode the text for URL
    const encodedText = encodeQRData(text);

    // Construct API URL
    const apiUrl = `${QR_SERVER_URL}/${QR_API_ENDPOINT}/?size=${size}&data=${encodedText}`;

    // Handle URL format (direct return)
    if (format === 'url') {
      return {
        success: true,
        data: apiUrl,
        format: 'url',
        meta: {
          size,
          textLength: text.length,
          timestamp: new Date().toISOString()
        }
      };
    }

    // Handle base format (fetch and encode)
    if (format === 'base') {
      const baseData = await getQRCodeBase(text, size, timeout);
      
      if (baseData.success) {
        return {
          success: true,
          data: baseData.data,
          format: 'base',
          meta: {
            size,
            textLength: text.length,
            timestamp: new Date().toISOString(),
            mimeType: 'image/png'
          }
        };
      } else {
        return baseData;
      }
    }

  } catch (error) {
    console.error('[QRService] Unexpected error in generateQRCode:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      data: null,
      format: null,
      error: `QR generation failed: ${error.message}`
    };
  }
};

/
  Get QR code as direct URL from API
  
  @param {string} text - Text to encode
  @param {string} size - QR code size (WIDTHxHEIGHT)
  @returns {string} Direct API URL for QR code image
 /
exports.getQRCodeURL = (text, size = null) => {
  const textValidation = validateQRText(text);
  if (textValidation) {
    throw new Error(textValidation);
  }

  const qrSize = size || QR_CODE_SIZE || DEFAULT_SIZE;
  const sizeValidation = validateQRSize(qrSize);
  if (!sizeValidation) {
    throw new Error(`Invalid QR size format: ${qrSize}`);
  }

  const encodedText = encodeQRData(text);
  return `${QR_SERVER_URL}/${QR_API_ENDPOINT}/?size=${qrSize}&data=${encodedText}`;
};

/
  Get QR code as base encoded string
  Fetches the QR image from API and converts to base
  
  @param {string} text - Text to encode
  @param {string} size - QR code size (WIDTHxHEIGHT)
  @param {number} timeout - Request timeout in ms
  @returns {Promise<{success: boolean, data?: string, error?: string}>}
 /
exports.getQRCodeBase = async (text, size = null, timeout = ) => {
  try {
    const textValidation = validateQRText(text);
    if (textValidation) {
      return {
        success: false,
        error: textValidation
      };
    }

    const qrSize = size || QR_CODE_SIZE || DEFAULT_SIZE;
    const sizeValidation = validateQRSize(qrSize);
    if (!sizeValidation) {
      return {
        success: false,
        error: `Invalid QR size format: ${qrSize}`
      };
    }

    const encodedText = encodeQRData(text);
    const apiUrl = `${QR_SERVER_URL}/${QR_API_ENDPOINT}/?size=${qrSize}&data=${encodedText}`;

    console.log('[QRService] Fetching QR code as base:', {
      size: qrSize,
      textLength: text.length,
      timestamp: new Date().toISOString()
    });

    // Fetch image with timeout
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      timeout
    });

    // Convert to base
    const baseData = Buffer.from(response.data).toString('base');
    const dataUrl = `data:image/png;base,${baseData}`;

    return {
      success: true,
      data: dataUrl
    };

  } catch (error) {
    const errorMessage = error.response?.statusText || error.message || 'Unknown error';
    
    console.error('[QRService] Error fetching QR code as base:', {
      message: errorMessage,
      statusCode: error.response?.status,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: `Failed to fetch QR code: ${errorMessage}`
    };
  }
};

/
  Validate QR text input
  
  @param {} text - Text to validate
  @returns {string|null} Error message if invalid, null if valid
 /
function validateQRText(text) {
  // Type check
  if (typeof text !== 'string') {
    return `Invalid text type. Expected string, got: ${typeof text}`;
  }

  // Empty check
  if (text.trim().length === ) {
    return 'QR text cannot be empty or whitespace only';
  }

  // Length check
  if (text.length > MAX_TEXT_LENGTH) {
    return `QR text exceeds maximum length of ${MAX_TEXT_LENGTH} characters (current: ${text.length})`;
  }

  return null;
}

/
  Validate QR code size format
  
  @param {string} size - Size string to validate (format: WIDTHxHEIGHT)
  @returns {boolean} True if valid, false otherwise
 /
function validateQRSize(size) {
  if (typeof size !== 'string') {
    return false;
  }

  const sizeRegex = /^\d+x\d+$/;
  if (!sizeRegex.test(size)) {
    return false;
  }

  const [width, height] = size.split('x').map(Number);
  
  // Validate range (min , max )
  if (width <  || width >  || height <  || height > ) {
    return false;
  }

  return true;
}

/
  Encode text for QR API URL
  Properly encodes special characters and spaces
  
  @param {string} text - Text to encode
  @returns {string} URL-encoded text
 /
function encodeQRData(text) {
  return encodeURIComponent(text);
}

/
  Health check for QR service
  Tests connectivity to QRServer API
  
  @param {number} timeout - Request timeout in ms
  @returns {Promise<{healthy: boolean, message: string, responseTime?: number}>}
 /
exports.healthCheck = async (timeout = ) => {
  try {
    const startTime = Date.now();
    
    // Test with a simple QR request
    const testText = 'health-check-' + Date.now();
    const encodedText = encodeURIComponent(testText);
    const apiUrl = `${QR_SERVER_URL}/${QR_API_ENDPOINT}/?size=x&data=${encodedText}`;

    const response = await axios.head(apiUrl, { timeout });
    const responseTime = Date.now() - startTime;

    if (response.status === ) {
      return {
        healthy: true,
        message: 'QRServer API is responding normally',
        responseTime,
        timestamp: new Date().toISOString()
      };
    }

    return {
      healthy: false,
      message: `QRServer API returned status ${response.status}`,
      responseTime,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    const responseTime = error.response?.headers?.['x-response-time'];
    
    console.error('[QRService] Health check failed:', {
      message: error.message,
      statusCode: error.response?.status,
      timestamp: new Date().toISOString()
    });

    return {
      healthy: false,
      message: `QRServer API health check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
};

/
  Get service information
  
  @returns {Object} Service metadata
 /
exports.getServiceInfo = () => {
  return {
    name: 'QR Service',
    version: '..',
    apiEndpoint: QR_SERVER_URL,
    defaultSize: QR_CODE_SIZE || DEFAULT_SIZE,
    maxTextLength: MAX_TEXT_LENGTH,
    supportedFormats: ['url', 'base'],
    features: [
      'Generate QR codes from text',
      'Support multiple output formats',
      'Error handling and validation',
      'Health monitoring',
      'Configurable size and timeout'
    ]
  };
};
