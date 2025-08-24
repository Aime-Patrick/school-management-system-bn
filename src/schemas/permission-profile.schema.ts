import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PermissionResource, PermissionAction } from './permission.schema';

@Schema({ timestamps: true })
export class PermissionProfile {
  @Prop({ required: true })
  name: string; // e.g., "Fee Manager", "Student Viewer", "Teacher Assistant"

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [Object] })
  permissions: {
    resource: PermissionResource;
    actions: PermissionAction[];
  }[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDefault: boolean; // Whether this is a system default profile
}

export const PermissionProfileSchema = SchemaFactory.createForClass(PermissionProfile);

// Create indexes for efficient queries
PermissionProfileSchema.index({ schoolId: 1, isActive: 1 });
PermissionProfileSchema.index({ createdBy: 1 });
PermissionProfileSchema.index({ isDefault: 1 });
