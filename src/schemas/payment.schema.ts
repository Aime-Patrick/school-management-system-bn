import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export enum paymentStatus{
    PENDING= 'pending',
    APPROVED="approved",
    REJECTED="rejected"
}

export enum paymentPlan{
    MONTHLY="monthly",
    quarterly="quarterly",
    YEARLY="yearly"
}
@Schema({ timestamps: true })
export class Payment {
    @Prop({type: mongoose.Schema.ObjectId,ref: "School"})
    schoolId:mongoose.Types.ObjectId;

    @Prop({required: true})
    amount:number

    @Prop({required: true, enum:paymentStatus, default: "pending"})
    status:paymentStatus

    @Prop({required: true, enum:paymentPlan})
    plan:paymentPlan

    @Prop({required: true})
    proof:string[]

    @Prop({ required: true, type: Date })
    date: Date;

    @Prop({required: true, type: Number , default: 0})
    totalPayment: number
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);