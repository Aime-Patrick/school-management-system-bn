import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PermissionResource, PermissionAction } from './permission.schema';

@Schema({ timestamps: true })
export class UserPermission {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ required: true, enum: PermissionResource })
  resource: string;

  @Prop({ required: true, enum: PermissionAction })
  action: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  grantedBy: Types.ObjectId; // Who granted this permission

  @Prop({ type: Date })
  expiresAt?: Date; // Optional expiration

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String })
  reason?: string; // Optional reason for granting permission
}

export const UserPermissionSchema = SchemaFactory.createForClass(UserPermission);

// Create compound indexes for efficient queries
UserPermissionSchema.index({ userId: 1, schoolId: 1, isActive: 1 });
UserPermissionSchema.index({ resource: 1, action: 1, isActive: 1 });
UserPermissionSchema.index({ schoolId: 1, isActive: 1 });
UserPermissionSchema.index({ expiresAt: 1, isActive: 1 });
