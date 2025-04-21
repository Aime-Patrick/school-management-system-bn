import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {Document} from "mongoose";


export enum planType{
    MONTHLY="monthly",
    quarterly="quarterly",
    YEARLY="yearly"
}
@Schema({timestamps: true})
export class subscriptionPlan extends Document {
@Prop({required: true})
planName : string;

@Prop({required: true})
planAmount: number;

@Prop({required: true, enum:planType})
planType:planType

@Prop({required: true})
planDuration: number;

@Prop({required: true})
planContent: string[];

@Prop({required: true, default: true})
isActive: boolean;
}


export const subscriptionPlanSchema = SchemaFactory.createForClass(subscriptionPlan);
