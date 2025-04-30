import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  Types } from 'mongoose';
import { User } from './user.schema';

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
export enum StudentGender {
  MALE = 'Male',
  FEMALE = 'Female',
}

@Schema({ timestamps: true })
export class Student {
  @Prop({ type: Types.ObjectId, ref: 'User'})
  accountCredentails: User;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true  })
  registrationNumber: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true, enum: StudentGender })
  gender: StudentGender;
  @Prop({ required: false,  unique: true })
  phoneNumber: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true, type: Date, default: Date.now })
  enrollmentDate: Date;

  @Prop({ required: false, type: Date })
  graduationDate?: Date;
  @Prop({ required: true, enum: StudentStatus, default: StudentStatus.ACTIVE })
  status: StudentStatus;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Class' })
  class: Types.ObjectId;
  // @Prop({ required: false })
  // parentId: string;
  @Prop({ required: false, ref: "Course" })
  courseIds: Types.ObjectId[];
  @Prop({ type: Types.ObjectId,ref: 'School' })
  school: Types.ObjectId;

  @Prop({required:true})
  profilePicture: string
}

export const StudentSchema = SchemaFactory.createForClass(Student);