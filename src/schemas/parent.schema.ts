import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';

export enum ParentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ParentGender {
  MALE = 'male',
  FEMALE = 'female',
}

@Schema({ timestamps: true })
export class Parent {
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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }] })
  children: Types.ObjectId[];

  @Prop({ required: true, enum: ParentStatus })
  status: ParentStatus;

  @Prop({ required: true })
  relationshipStatus: string;

  @Prop({ required: true, enum: ParentGender })
  gender: ParentGender;
}

export const ParentSchema = SchemaFactory.createForClass(Parent);
