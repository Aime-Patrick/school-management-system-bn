import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Term } from "./terms.schama";
import { Teacher } from "./teacher.schema";
import { Course } from "./course.schema";

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Course;

  @Prop({ type: Types.ObjectId, ref: 'Teacher', required: true })
  teacher: Teacher;

  @Prop({ type: Types.ObjectId, ref: 'Term', required: true })
  term: Term;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ type: [{ student: { type: Types.ObjectId, ref: 'Student' }, score: Number }] })
  submissions: { student: Types.ObjectId; score: number }[];
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
