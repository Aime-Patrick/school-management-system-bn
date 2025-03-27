import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Finance extends Document {
  @Prop({ required: true })
  payerName: string;

  @Prop({ required: true, enum: ['Tuition', 'Library Fee', 'Transport', 'Others'] })
  paymentType: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ required: true, enum: ['Paid', 'Unpaid'] })
  status: string;

  @Prop()
  receiptUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  school: Types.ObjectId;
}

export const FinanceSchema = SchemaFactory.createForClass(Finance);
