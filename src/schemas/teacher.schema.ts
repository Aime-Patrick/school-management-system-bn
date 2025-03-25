import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {User} from './user.schema';
import {Course} from './course.schema';

export enum TeacherStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum TeacherGender {
    MALE ='male',
    FEMALE = 'female',
}

@Schema({ timestamps: true })
export class Teacher {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: User;
    @Prop({ required: true })
    firstName: string;
    
    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true })
    dateOfBirth: Date;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    hireDate: Date;

    @Prop({ required: true })
    status: TeacherStatus;

    @Prop({ required: true })
    department: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }] })
    coursesTaught: Types.ObjectId[];
}