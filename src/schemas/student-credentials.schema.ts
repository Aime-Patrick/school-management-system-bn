import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class StudentCredentials extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  registrationNumber: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true })
  class: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true })
  student: mongoose.Types.ObjectId;
}

export const StudentCredentialsSchema = SchemaFactory.createForClass(StudentCredentials);