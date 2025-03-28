import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  eventName: string;

  @Prop({ required: true })
  time: Date;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    required: true,
  })
  invitees: Types.ObjectId[];
}

export const EventSchema = SchemaFactory.createForClass(Event);