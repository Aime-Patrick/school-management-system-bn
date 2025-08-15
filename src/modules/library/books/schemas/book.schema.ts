import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  RESERVED = 'RESERVED',
  DAMAGED = 'DAMAGED',
  LOST = 'LOST',
}

@Schema({ timestamps: true })
export class Book extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  authors: string[];

  @Prop({ unique: true, sparse: true })
  ISBN?: string;

  @Prop()
  publisher?: string;

  @Prop()
  category?: string;

  @Prop()
  language?: string;

  @Prop()
  edition?: string;

  @Prop({ default: 1 })
  totalCopies: number;

  @Prop({ default: 1 })
  availableCopies: number;

  @Prop()
  location?: string;

  @Prop()
  coverImageUrl?: string;

  @Prop({ enum: BookStatus, default: BookStatus.AVAILABLE })
  status: BookStatus;

  @Prop({ type: Types.ObjectId, ref: 'School' })
  school?: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop()
  publicationYear?: number;

  @Prop()
  pages?: number;

  @Prop()
  format?: string;

  @Prop({ default: 0 })
  borrowCount: number;

  @Prop({ default: 0 })
  reservationCount: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);

// Index for better search performance
BookSchema.index({ title: 'text', authors: 'text', ISBN: 'text' });
BookSchema.index({ category: 1, status: 1 });
BookSchema.index({ school: 1, status: 1 });
