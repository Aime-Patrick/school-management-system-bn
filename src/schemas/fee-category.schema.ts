import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum FeeFrequency {
  MONTHLY = 'monthly',
  TERM = 'term',
  SEMESTER = 'semester',
  YEARLY = 'yearly',
  ONE_TIME = 'one_time',
}

@Schema({ timestamps: true })
export class FeeCategory extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: FeeFrequency })
  frequency: FeeFrequency;

  @Prop({ required: true, type: Types.ObjectId, ref: 'School' })
  school: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isCustom: boolean;

  @Prop({ type: String })
  customFields?: string[];
}

export const FeeCategorySchema = SchemaFactory.createForClass(FeeCategory);
