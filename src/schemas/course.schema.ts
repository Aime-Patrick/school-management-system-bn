import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

enum CourseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

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
  credits: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }] })
  teacherIds: mongoose.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }] })
  studentIds: mongoose.Types.ObjectId[];

  @Prop({ required: true, default: CourseStatus.ACTIVE, enum: CourseStatus })
  status: CourseStatus;

  @Prop({ required: true, type: Types.ObjectId, ref: 'School' })
  school: Types.ObjectId;
}
export const CourseSchema = SchemaFactory.createForClass(Course);
