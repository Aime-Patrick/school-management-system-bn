import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum InstallmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class InstallmentPlan extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Student' })
  student: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'FeeAssignment' })
  feeAssignment: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'School' })
  school: Types.ObjectId;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  numberOfInstallments: number;

  @Prop({ required: true })
  installmentAmount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, enum: InstallmentStatus, default: InstallmentStatus.ACTIVE })
  status: InstallmentStatus;

  @Prop({ default: 0 })
  paidAmount: number;

  @Prop({ default: 0 })
  remainingAmount: number;

  @Prop({ default: 0 })
  paidInstallments: number;

  @Prop({ default: 0 })
  defaultedInstallments: number;

  @Prop({ type: Number })
  lateFeeAmount?: number;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;
}

export const InstallmentPlanSchema = SchemaFactory.createForClass(InstallmentPlan);
