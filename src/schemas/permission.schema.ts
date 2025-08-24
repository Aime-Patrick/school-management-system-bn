import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
}

export enum PermissionResource {
  FEE_CATEGORIES = 'FEE_CATEGORIES',
  FEE_STRUCTURES = 'FEE_STRUCTURES',
  FEE_ASSIGNMENTS = 'FEE_ASSIGNMENTS',
  PAYMENTS = 'PAYMENTS',
  STUDENTS = 'STUDENTS',
  TEACHERS = 'TEACHERS',
  PARENTS = 'PARENTS',
  LIBRARY = 'LIBRARY',
  BOOKS = 'BOOKS',
  BORROW_RECORDS = 'BORROW_RECORDS',
  MEMBERS = 'MEMBERS',
  CLASSES = 'CLASSES',
  COURSES = 'COURSES',
  ASSIGNMENTS = 'ASSIGNMENTS',
  RESULTS = 'RESULTS',
  QUIZZES = 'QUIZZES',
  EVENTS = 'EVENTS',
  ACADEMIC_YEARS = 'ACADEMIC_YEARS',
  TERMS = 'TERMS',
  USERS = 'USERS',
  SCHOOLS = 'SCHOOLS',
  FINANCIAL = 'FINANCIAL',
  REPORTS = 'REPORTS',
}

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true, enum: PermissionResource })
  resource: string;

  @Prop({ required: true, enum: PermissionAction })
  action: string;

  @Prop({ required: true, type: [String] })
  roles: string[];

  @Prop({ type: Object, default: {} })
  conditions: {
    schoolId?: string;
    isOwner?: boolean;
    [key: string]: any;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'School', required: false })
  school?: Types.ObjectId; // For school-specific permissions
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// Create compound index for efficient queries
PermissionSchema.index({ resource: 1, action: 1, isActive: 1 });
PermissionSchema.index({ roles: 1, isActive: 1 });
PermissionSchema.index({ school: 1, isActive: 1 });
