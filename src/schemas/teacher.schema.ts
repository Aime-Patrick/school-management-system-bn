import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import mongoose, {Types} from 'mongoose';
import {User} from './user.schema';
import {Course} from './course.schema';
import { School } from './school.schema';

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
    @Prop({ type: mongoose.Schema.ObjectId, ref: 'User' })
    accountCredentails: User;
    @Prop({ required: true })
    firstName: string;
    
    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true })
    dateOfBirth: Date;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    hiredDate: Date;

    @Prop({ required: true })
    status: TeacherStatus;

    @Prop({ required: true })
    department: string;

    @Prop({ type: [{ type: mongoose.Schema.ObjectId, ref: 'Course' }] })
    coursesTaught: Course[];

    @Prop({ required: true, enum: TeacherGender })
    gender: TeacherGender;

    @Prop({ type: mongoose.Schema.ObjectId, ref: 'School', required: true })
    school: School;

    @Prop({required:false})
    profilePicture: string
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);