import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Result extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  student: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  class: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['Midterm', 'Final', 'Assessment'],
    required: true,
  })
  examType: string;

  @Prop({
    type: [
      {
        subject: { type: String, required: true },
        score: { type: Number, required: true },
        maxScore: { type: Number, required: true },
      },
    ],
    required: true,
  })
  subjectResults: {
    subject: string;
    score: number;
    maxScore: number;
  }[];

  @Prop({ type: Number, required: true })
  totalScore: number;

  @Prop({ type: Number, required: true })
  percentage: number;

  @Prop({ type: String })
  remarks: string;
}

export const ResultSchema = SchemaFactory.createForClass(Result);