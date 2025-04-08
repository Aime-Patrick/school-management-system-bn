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

  @Prop({ required: true })
  enrollmentDate: Date;

  @Prop()
  graduationDate?: Date;
  @Prop({ required: true })
  status: StudentStatus;
  @Prop({ required: false })
  parentId: string;
  @Prop({ required: true, ref: "Course" })
  courseIds: Types.ObjectId[];
  @Prop({ type: Types.ObjectId,ref: 'School' })
  school: Types.ObjectId;

  @Prop({required:true})
  profileImage: string
}

export const StudentSchema = SchemaFactory.createForClass(Student);