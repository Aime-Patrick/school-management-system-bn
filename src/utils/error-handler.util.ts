import { BadRequestException } from '@nestjs/common';

export interface ValidationErrorItem {
  field: string;
  message: string;
  value: any;
  kind: string;
}

export interface DuplicateKeyErrorDetails {
  field: string;
  value: string;
  suggestion: string;
  code: string;
}

export interface ValidationErrorDetails {
  validationErrors: ValidationErrorItem[];
  suggestion: string;
  code: string;
}

export interface GenericErrorDetails {
  suggestion: string;
  code: string;
}

export interface CastErrorDetails {
  field: string;
  value: any;
  suggestion: string;
  code: string;
}

export interface MongoErrorDetails {
  code: string | number | undefined;
  suggestion: string;
  mongoCode?: string | number | undefined;
}

export interface UnknownErrorDetails {
  suggestion: string;
  code: string;
  originalError?: string;
}

export type ErrorDetails = 
  | DuplicateKeyErrorDetails 
  | ValidationErrorDetails 
  | GenericErrorDetails 
  | CastErrorDetails 
  | MongoErrorDetails 
  | UnknownErrorDetails;

export interface ErrorResponse {
  message: string;
  errorCode: string;
  details: ErrorDetails;
}

export class ErrorHandlerUtil {
  /**
   * Handle MongoDB duplicate key errors and return user-friendly error messages
   */
  static handleDuplicateKeyError(error: any): never {
    if (error.code === 11000) {
      const fieldMatch = error.message.match(/dup key: \{ (.+): "(.+)" \}/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldValue = fieldMatch[2];
        
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
          'studentId': 'Student ID',
          'courseId': 'Course ID',
          'teacherId': 'Teacher ID',
          'parentId': 'Parent ID',
          'librarianId': 'Librarian ID',
          'accountantId': 'Accountant ID',
        };

        const displayName = fieldDisplayNames[fieldName] || fieldName;
        
              const errorResponse: ErrorResponse = {
        message: `${displayName} already exists`,
        errorCode: 'DUPLICATE_ENTRY',
        details: {
          field: fieldName,
          value: fieldValue,
          suggestion: `Please use a different ${displayName.toLowerCase()}`,
          code: 'DUPLICATE_ENTRY',
        } as DuplicateKeyErrorDetails,
      };

        throw new BadRequestException(errorResponse);
      }
    }
    
    // If it's not a duplicate key error or we can't parse it, re-throw the original error
    throw error;
  }

  /**
   * Handle MongoDB validation errors
   */
  static handleValidationError(error: any): never {
    if (error.name === 'ValidationError') {
      const validationErrors: ValidationErrorItem[] = [];
      
      for (const field in error.errors) {
        const fieldError = error.errors[field];
        validationErrors.push({
          field,
          message: fieldError.message,
          value: fieldError.value,
          kind: fieldError.kind,
        });
      }

      const errorResponse: ErrorResponse = {
        message: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        details: {
          validationErrors,
          suggestion: 'Please check the highlighted fields and try again',
          code: 'SCHEMA_VALIDATION_FAILED',
        } as ValidationErrorDetails,
      };

      throw new BadRequestException(errorResponse);
    }
    
    throw error;
  }

  /**
   * Handle MongoDB cast errors (invalid ObjectId, etc.)
   */
  static handleCastError(error: any): never {
    if (error.name === 'CastError') {
      const errorResponse: ErrorResponse = {
        message: 'Invalid data format',
        errorCode: 'CAST_ERROR',
        details: {
          field: error.path,
          value: error.value,
          suggestion: 'Please provide a valid format for this field',
          code: 'INVALID_DATA_FORMAT',
        } as CastErrorDetails,
      };

      throw new BadRequestException(errorResponse);
    }
    
    throw error;
  }

  /**
   * Generic error handler for MongoDB operations
   */
  static handleMongoError(error: any): never {
    // Try to handle specific error types
    try {
      this.handleDuplicateKeyError(error);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
    }

    try {
      this.handleValidationError(error);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
    }

    try {
      this.handleCastError(error);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
    }

    // If none of the specific handlers worked, throw a generic error
    const errorResponse: ErrorResponse = {
      message: 'Database operation failed',
      errorCode: 'MONGODB_ERROR',
      details: {
        suggestion: 'Please try again or contact support if the problem persists',
        code: 'UNKNOWN_DB_ERROR',
        originalError: error.message,
      } as UnknownErrorDetails,
    };

    throw new BadRequestException(errorResponse);
  }

  /**
   * Check if an error is a duplicate key error
   */
  static isDuplicateKeyError(error: any): boolean {
    return error.code === 11000;
  }

  /**
   * Check if an error is a validation error
   */
  static isValidationError(error: any): boolean {
    return error.name === 'ValidationError';
  }

  /**
   * Check if an error is a cast error
   */
  static isCastError(error: any): boolean {
    return error.name === 'CastError';
  }
}
