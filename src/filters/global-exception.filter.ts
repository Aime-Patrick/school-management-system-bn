import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;
    let errorCode = 'UNKNOWN_ERROR';

    // Handle MongoDB duplicate key errors
    if (exception instanceof MongoError && exception.code === 11000) {
      status = HttpStatus.CONFLICT;
      errorCode = 'DUPLICATE_KEY_ERROR';
      
      // Extract field name from error message
      const fieldMatch = exception.message.match(/dup key: \{ (.+): "(.+)" \}/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldValue = fieldMatch[2];
        
        // Human-readable field names
        const fieldDisplayNames: { [key: string]: string } = {
          'email': 'Email address',
          'phoneNumber': 'Phone number',
          'username': 'Username',
          'registrationNumber': 'Registration number',
          'schoolName': 'School name',
          'className': 'Class name',
          'feeCategory': 'Fee category',
          'academicYear': 'Academic year',
          'term': 'Term',
          'profileImage': 'Profile image',
          'schoolLogo': 'School logo',
        };

        const displayName = fieldDisplayNames[fieldName] || fieldName;
        
        message = `${displayName} already exists`;
        details = {
          field: fieldName,
          value: fieldValue,
          suggestion: `Please use a different ${displayName.toLowerCase()}`,
          code: 'DUPLICATE_ENTRY',
        };
      } else {
        message = 'Duplicate entry found';
        details = {
          suggestion: 'Please check your input and try again',
          code: 'DUPLICATE_ENTRY',
        };
      }
    }
    // Handle MongoDB validation errors
    else if (exception instanceof MongoError && exception.code === 121) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'VALIDATION_ERROR';
      message = 'Document validation failed';
      details = {
        suggestion: 'Please check your input data and try again',
        code: 'DOCUMENT_VALIDATION_FAILED',
      };
    }
    // Handle MongoDB connection errors
    else if (exception instanceof MongoError && exception.code === 11001) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      errorCode = 'CONNECTION_ERROR';
      message = 'Database connection failed';
      details = {
        suggestion: 'Please try again later or contact support',
        code: 'DB_CONNECTION_FAILED',
      };
    }
          // Handle Mongoose validation errors
      else if (exception instanceof MongooseError.ValidationError) {
        status = HttpStatus.BAD_REQUEST;
        errorCode = 'VALIDATION_ERROR';
        message = 'Validation failed';
        
        const validationErrors: Array<{
          field: string;
          message: string;
          value: any;
          kind: string;
        }> = [];
        
        for (const field in exception.errors) {
          const error = exception.errors[field];
          validationErrors.push({
            field,
            message: error.message,
            value: error.value,
            kind: error.kind,
          });
        }
        
        details = {
          validationErrors,
          suggestion: 'Please check the highlighted fields and try again',
          code: 'SCHEMA_VALIDATION_FAILED',
        };
      }
    // Handle Mongoose cast errors (invalid ObjectId, etc.)
    else if (exception instanceof MongooseError.CastError) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'CAST_ERROR';
      message = 'Invalid data format';
      details = {
        field: exception.path,
        value: exception.value,
        suggestion: 'Please provide a valid format for this field',
        code: 'INVALID_DATA_FORMAT',
      };
    }
    // Handle other MongoDB errors
    else if (exception instanceof MongoError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = 'MONGODB_ERROR';
      message = 'Database operation failed';
      details = {
        code: exception.code,
        suggestion: 'Please try again or contact support if the problem persists',
        mongoCode: exception.code,
      };
    }
    // Handle NestJS HTTP exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const response = exceptionResponse as any;
        message = response.message || exception.message;
        
        // Handle validation pipe errors specifically
        if (response.message && Array.isArray(response.message) && response.message.some((msg: string) => msg.includes('should not exist'))) {
          errorCode = 'INVALID_PROPERTIES';
          message = 'Invalid properties in request body';
          
          // Extract the property names from the error messages
          const invalidProperties: string[] = [];
          response.message.forEach((msg: string) => {
            const match = msg.match(/property (\w+) should not exist/);
            if (match) {
              invalidProperties.push(match[1]);
            }
          });
          
          details = {
            invalidProperties,
            suggestion: `Please remove these properties from your request: ${invalidProperties.join(', ')}`,
            code: 'INVALID_PROPERTIES',
            allowedProperties: 'Only username, email, password, phoneNumber, department, employmentType, startDate, qualifications, and experience are allowed',
          };
        } else {
          details = response.details || null;
          errorCode = response.errorCode || 'HTTP_EXCEPTION';
        }
      } else {
        message = exception.message;
      }
    }
    // Handle validation pipe errors
    else if (exception instanceof Error && exception.message.includes('Validation failed')) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'VALIDATION_PIPE_ERROR';
      message = 'Request validation failed';
      details = {
        suggestion: 'Please check your request data and try again',
        code: 'REQUEST_VALIDATION_FAILED',
      };
    }
    // Handle property whitelist validation errors
    else if (exception instanceof Error && exception.message.includes('property') && exception.message.includes('should not exist')) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'INVALID_PROPERTIES';
      message = 'Invalid properties in request body';
      
      // Extract the property names from the error message
      const propertyMatches = exception.message.match(/property (\w+) should not exist/g);
      const invalidProperties = propertyMatches ? propertyMatches.map(match => match.replace('property ', '').replace(' should not exist', '')) : [];
      
      details = {
        invalidProperties,
        suggestion: `Please remove these properties from your request: ${invalidProperties.join(', ')}`,
        code: 'INVALID_PROPERTIES',
        allowedProperties: 'Only username, email, password, phoneNumber, department, employmentType, startDate, qualifications, and experience are allowed',
      };
    }
    // Handle generic errors
    else if (exception instanceof Error) {
      errorCode = 'GENERIC_ERROR';
      message = exception.message || 'An unexpected error occurred';
      details = {
        suggestion: 'Please try again or contact support',
        code: 'UNEXPECTED_ERROR',
      };
    }

    const errorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        details,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
    };

    // Log the error for debugging
    this.logger.error(`Exception occurred: ${errorCode}`, {
      message: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      url: request.url,
      method: request.method,
      body: request.body,
      user: request.user,
      statusCode: status,
    });

    response.status(status).json(errorResponse);
  }
}
