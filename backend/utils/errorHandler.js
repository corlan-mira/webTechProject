/**
 * Error Handler Utility
 * Custom error classes and error utilities
 * 
 * Classes:
 *  - AppError: Base application error
 *  - ValidationError: Input validation error
 *  - NotFoundError: Resource not found
 *  - UnauthorizedError: Authentication failed
 *  - ForbiddenError: Authorization failed
 */

class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
};
