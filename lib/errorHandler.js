// Error handling utilities
export class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'APIError';
  }
}

export function handleAPIError(error) {
  console.error('API Error:', error);
  
  if (error instanceof APIError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }
  
  // Handle MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    return {
      error: 'Database operation failed',
      code: 'DATABASE_ERROR',
      statusCode: 500
    };
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError') {
    return {
      error: error.message,
      code: 'VALIDATION_ERROR',
      statusCode: 400
    };
  }
  
  // Default error
  return {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    statusCode: 500
  };
}