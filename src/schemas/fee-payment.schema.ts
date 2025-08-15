import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PaymentMode {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CARD = 'card',
  MOBILE_MONEY = 'mobile_money',
  ONLINE_PAYMENT = 'online_payment',
  CHEQUE = 'cheque',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentType {
  FULL = 'full',
  PARTIAL = 'partial',
  INSTALLMENT = 'installment',
}

@Schema({ timestamps: true })
export class FeePayment extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Student' })
  student: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'FeeAssignment' })
  feeAssignment: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'School' })
  school: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: PaymentMode })
  paymentMode: PaymentMode;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ required: true, enum: PaymentType, default: PaymentType.FULL })
  paymentType: PaymentType;

  @Prop({ required: true })
  paymentDate: Date;

  @Prop({ type: String })
  transactionId?: string;

  @Prop({ type: String })
  referenceNumber?: string;

  @Prop({ type: String })
  bankName?: string;

  @Prop({ type: String })
  accountNumber?: string;

  @Prop({ type: String })
  chequeNumber?: string;

  @Prop({ type: String })
  cardLastDigits?: string;

  @Prop({ type: String })
  cardType?: string;

  @Prop({ type: String })
  mobileMoneyProvider?: string;

  @Prop({ type: String })
  onlineGateway?: string;

  @Prop({ type: String })
  gatewayTransactionId?: string;

  @Prop({ type: String })
  receiptNumber?: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  recordedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: String })
  failureReason?: string;

  @Prop({ type: Number })
  refundAmount?: number;

  @Prop({ type: Date })
  refundDate?: Date;

  @Prop({ type: String })
  refundReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  refundedBy?: Types.ObjectId;

  @Prop({ type: String })
  refundNotes?: string;
}

export const FeePaymentSchema = SchemaFactory.createForClass(FeePayment);
