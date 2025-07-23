import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DaySchema } from './sub-schema.schema';

@Schema({ timestamps: true })
export class ClassCombination extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  grade: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Class' })
  parentClass: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Teacher' }] })
  assignedTeachers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }] })
  students: Types.ObjectId[];

  @Prop({
    type: [DaySchema],
    default: [],
  })
  timetable: {
    day: string;
    schedule: {
      subject: string;
      teacher: Types.ObjectId;
      startTime: string;
      endTime: string;
    }[];
  }[];

  @Prop({
    type: [
      { student: { type: Types.ObjectId, ref: 'Student' }, grades: [Number] },
    ],
  })
  performance: {
    student: Types.ObjectId;
    grades: number[];
  }[];
}

export const ClassCombinationSchema =
  SchemaFactory.createForClass(ClassCombination);
