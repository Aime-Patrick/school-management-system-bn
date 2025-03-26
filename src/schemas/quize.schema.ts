import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Student } from './student.schema';
import { Teacher } from './teacher.schema';
import { Course } from './course.schema';
import { Term } from './terms.schama';

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Course;

  @Prop({ type: Types.ObjectId, ref: 'Teacher', required: true })
  teacher: Teacher;

  @Prop({ type: Types.ObjectId, ref: 'Term', required: true })
  term: Term;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: [{ student: { type: Types.ObjectId, ref: 'Student' }, score: Number }] })
  results: { student: Types.ObjectId; score: number }[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
