import { Injectable } from '@nestjs/common';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { Payment, paymentStatus } from 'src/schemas/payment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PaymentService {
    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<Payment>
    ){}

    async recordPayment(dto: RecordPaymentDto):Promise<{message:string,payment:Payment}> {
        try {
            const payment = await this.paymentModel.create(dto);
        return {message:"Payment record successfull",payment};
        } catch (error) {
            throw error
        }
    }

    async getRecordPayment():Promise<Payment[]>{
        try {
            const payment = await this.paymentModel.find().populate('schoolId');
            return payment;
        } catch (error) {
            throw error;
        }
    }
}
