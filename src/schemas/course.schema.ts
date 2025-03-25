import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


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

  @Prop({ required: true })
  teacherIds: string[];

  @Prop({ required: true })
  studentIds: string[];

  @Prop({ required: true })
  status: string;
}
export const CourseSchema = SchemaFactory.createForClass(Course);
