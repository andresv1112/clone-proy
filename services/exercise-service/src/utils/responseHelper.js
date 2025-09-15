// Standardized response helpers for consistent API responses

const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    })
  }
  
  const errorResponse = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    }
    
    if (errors) {
      response.errors = errors
    }
    
    if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
      response.stack = new Error().stack
    }
    
    return res.status(statusCode).json(response)
  }
  
  const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
      timestamp: new Date().toISOString()
    })
  }
  
  module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse
  }