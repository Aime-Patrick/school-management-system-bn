import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ClassCombination } from './ClassCombination.schema';

@Schema({ timestamps: true })
export class Class extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ClassCombination' }] })
  combinations: Types.ObjectId[];

  @Prop({ required: true, type: Types.ObjectId, ref: 'School' })
  school: Types.ObjectId;
}

export const ClassSchema = SchemaFactory.createForClass(Class);