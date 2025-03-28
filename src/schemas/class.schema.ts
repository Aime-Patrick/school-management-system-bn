import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Class extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  grade: string; // Example: "Grade 1", "Grade 2"

  @Prop({ required: true, type: Types.ObjectId, ref: 'School' })
  school: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Teacher' }] })
  assignedTeachers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }] })
  students: Types.ObjectId[];

  @Prop({
    type: [
      {
        day: String, // Monday, Tuesday, etc.
        schedule: [
          {
            subject: String,
            teacher: { type: Types.ObjectId, ref: 'Teacher' },
            startTime: String, // "08:00 AM"
            endTime: String, // "09:00 AM"
          },
        ],
      },
    ],
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

  @Prop({ type: [{ student: { type: Types.ObjectId, ref: 'Student' }, grades: [Number] }] })
  performance: {
    student: Types.ObjectId;
    grades: number[];
  }[];
}

export const ClassSchema = SchemaFactory.createForClass(Class);
