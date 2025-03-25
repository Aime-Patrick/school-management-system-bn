import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  Types } from 'mongoose';
import { User } from './user.schema';

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
export enum StudentGender {
  MALE = 'male',
  FEMALE = 'female',
}

@Schema({ timestamps: true })
export class Student {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  registrationNumber: string;

  @Prop({ required: true })
  dateOfBirth: Date;
  @Prop({ required: true })
  grade: number;
  @Prop({ required: true, enum: StudentGender })
  gender: StudentGender;
  @Prop({ required: false })
  phoneNumber: string;
  @Prop({ required: true })
  address: string;
  @Prop({ required: true })
  city: string;
  @Prop({ required: true })
  enrollmentDate: Date;
  @Prop()
  graduationDate?: Date;
  @Prop({ required: true })
  status: StudentStatus;
  @Prop({ required: true })
  parentId: string;
  @Prop({ required: true })
  courseIds: string[];
  @Prop({ required: true, ref: 'School' })
  school: Types.ObjectId;
}

export const StudentSchema = SchemaFactory.createForClass(Student);