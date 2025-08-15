import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BorrowStatus {
  ISSUED = 'ISSUED',
  RETURNED = 'RETURNED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
  OVERDUE = 'OVERDUE',
}

@Schema({ timestamps: true })
export class BorrowRecord extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Member', required: true })
  memberId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ default: Date.now })
  borrowDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop()
  returnDate?: Date;

  @Prop({ enum: BorrowStatus, default: BorrowStatus.ISSUED })
  status: BorrowStatus;

  @Prop({ default: 0 })
  fineAmount: number;

  @Prop()
  note?: string;

  @Prop({ type: Types.ObjectId, ref: 'School' })
  school?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  issuedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  returnedTo?: Types.ObjectId;

  @Prop({ default: 0 })
  daysOverdue: number;

  @Prop()
  returnNotes?: string;

  @Prop()
  damageDescription?: string;

  @Prop({ default: false })
  isRenewed: boolean;

  @Prop()
  renewalCount: number;

  @Prop()
  originalDueDate?: Date;
}

export const BorrowRecordSchema = SchemaFactory.createForClass(BorrowRecord);

// Indexes for better performance
BorrowRecordSchema.index({ memberId: 1, status: 1 });
BorrowRecordSchema.index({ bookId: 1, status: 1 });
BorrowRecordSchema.index({ school: 1, status: 1 });
BorrowRecordSchema.index({ dueDate: 1, status: 1 });
BorrowRecordSchema.index({ borrowDate: 1 });
BorrowRecordSchema.index({ returnDate: 1 });
