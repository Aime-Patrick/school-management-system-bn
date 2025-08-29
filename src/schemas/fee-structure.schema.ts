import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum FeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

@Schema({ _id: false })
export class LateFeeRules {
  @Prop({ required: true, min: 0 })
  gracePeriod: number;

  @Prop({ required: true, min: 0 })
  lateFeeAmount: number;

  @Prop({ required: true, min: 0, max: 100 })
  lateFeePercentage: number;
}

@Schema({ timestamps: true })
export class FeeStructure extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'FeeCategory' })
  categoryId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Class' })
  classId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'School' })
  school: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Academic' })
  academicYearId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Term' })
  termId: Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  discountAmount: number;

  @Prop({ default: 0, min: 0, max: 100 })
  discountPercentage: number;

  @Prop({ 
    required: true, 
    enum: FeeStatus, 
    default: FeeStatus.ACTIVE 
  })
  status: FeeStatus;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ type: LateFeeRules })
  lateFeeRules?: LateFeeRules;
}

export const FeeStructureSchema = SchemaFactory.createForClass(FeeStructure);
