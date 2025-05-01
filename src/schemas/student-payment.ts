import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export enum paymentStatus {
    PAID = 'paid',
    UNPAID = 'unpaid',
}

export enum paymentMethod {
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
    MOBILE_MONEY = 'mobile_money',
    CHEQUE = 'cheque',
}

@Schema({ timestamps: true })
export class StudentPayment {
    @Prop({ type: mongoose.Schema.ObjectId, ref: "School" })
    schoolId: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.ObjectId, ref: "Student" })
    studentId: mongoose.Types.ObjectId;

    @Prop({ required: true, type: Number })
    schoolFees: number;

    @Prop({ required: true, enum: paymentStatus, default: "unpaid" })
    status: paymentStatus;

    @Prop({ required: true })
    proof: string[];

    @Prop({ required: true, type: Date })
    date: Date;

    @Prop({ required: true, type: mongoose.Schema.ObjectId, ref: "Term" })
    termId: mongoose.Types.ObjectId;

    @Prop({ required: true, type: mongoose.Schema.ObjectId, ref: "Academic" })
    academicId: mongoose.Types.ObjectId;

    @Prop({ required: true, type: String, enum: paymentMethod })
    paymentMethod: paymentMethod;
}

export const StudentPaymentSchema = SchemaFactory.createForClass(StudentPayment);