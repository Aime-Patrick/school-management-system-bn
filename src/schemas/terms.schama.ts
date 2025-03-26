import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Term {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;
}

export const TermSchema = SchemaFactory.createForClass(Term);
