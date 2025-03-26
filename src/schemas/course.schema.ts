import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  courseCode: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  credits: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Teacher' }] })
  teacherIds: Types.Array<Types.ObjectId>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }] })
  studentIds: Types.Array<Types.ObjectId>;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'School' })
  school: Types.ObjectId;
}
export const CourseSchema = SchemaFactory.createForClass(Course);
