import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MemberRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  STAFF = 'STAFF',
  LIBRARIAN = 'LIBRARIAN',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Schema({ timestamps: true })
export class Member extends Document {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true, unique: true })
  memberId: string;

  @Prop({ enum: MemberRole, required: true })
  role: MemberRole;

  @Prop()
  classOrDept?: string;

  @Prop({ default: Date.now })
  joinDate: Date;

  @Prop()
  expiryDate?: Date;

  @Prop({ default: 3 })
  maxBorrowLimit: number;

  @Prop({ enum: MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus;

  @Prop({ type: Types.ObjectId, ref: 'School' })
  school?: Types.ObjectId;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  email?: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ default: 0 })
  currentBorrowCount: number;

  @Prop({ default: 0 })
  totalBorrowCount: number;

  @Prop({ default: 0 })
  overdueCount: number;

  @Prop({ default: 0 })
  fineAmount: number;

  @Prop()
  notes?: string;
}

export const MemberSchema = SchemaFactory.createForClass(Member);

// Indexes for better performance
MemberSchema.index({ userId: 1 });
MemberSchema.index({ memberId: 1 });
MemberSchema.index({ school: 1, status: 1 });
MemberSchema.index({ role: 1, status: 1 });
