import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ScholarshipType {
  MERIT_BASED = 'merit_based',
  NEED_BASED = 'need_based',
  SPORTS = 'sports',
  ACADEMIC = 'academic',
  SIBLING = 'sibling',
  STAFF_CHILD = 'staff_child',
  CUSTOM = 'custom',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

@Schema({ timestamps: true })
export class Scholarship extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ScholarshipType })
  type: ScholarshipType;

  @Prop({ required: true, enum: DiscountType })
  discountType: DiscountType;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'School' })
  school: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class' })
  applicableClass?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'FeeCategory' })
  applicableFeeCategory?: Types.ObjectId;

  @Prop({ type: Date })
  validFrom?: Date;

  @Prop({ type: Date })
  validUntil?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Number })
  maxDiscountAmount?: number;

  @Prop({ type: Number })
  minAmountRequired?: number;

  @Prop({ type: String })
  eligibilityCriteria?: string;

  @Prop({ type: String })
  requiredDocuments?: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const ScholarshipSchema = SchemaFactory.createForClass(Scholarship);
