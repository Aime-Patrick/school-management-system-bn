import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class FeeStructure extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'FeeCategory' })
  feeCategory: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Class' })
  class: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'School' })
  school: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  academicYear: string;

  @Prop({ required: true })
  term: string;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ default: 0 })
  discountPercentage: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ default: 0 })
  lateFeeAmount: number;

  @Prop({ default: 0 })
  lateFeePercentage: number;

  @Prop({ type: Number })
  gracePeriodDays?: number;
}

export const FeeStructureSchema = SchemaFactory.createForClass(FeeStructure);
