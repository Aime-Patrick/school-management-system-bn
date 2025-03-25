import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "./user.schema";

@Schema({ timestamps: true })
export class School {
  @Prop({ required: true, unique: true })
  schoolName: string;

  @Prop({ required: true, unique: true })
  schoolCode: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) 
  schoolAdmin: User;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
