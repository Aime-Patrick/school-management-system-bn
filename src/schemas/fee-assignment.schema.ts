import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AssignmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
  SUBMITTED = "SUBMITTED",
}

@Schema({ timestamps: true })
export class FeeAssignment extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Student' })
  student: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'FeeStructure' })
  feeStructure: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'School' })
  school: Types.ObjectId;

  @Prop({ required: true, enum: AssignmentStatus, default: AssignmentStatus.ACTIVE })
  status: AssignmentStatus;

  @Prop({ required: true })
  assignedAmount: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ default: 0 })
  discountPercentage: number;

  @Prop({ default: 0 })
  scholarshipAmount: number;

  @Prop({ type: String })
  scholarshipType?: string;

  @Prop({ type: String })
  scholarshipReason?: string;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ default: 0 })
  lateFeeAmount: number;

  @Prop({ default: 0 })
  lateFeePercentage: number;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedBy: Types.ObjectId;

  @Prop({ type: Date })
  assignedDate: Date;
}

export const FeeAssignmentSchema = SchemaFactory.createForClass(FeeAssignment);
