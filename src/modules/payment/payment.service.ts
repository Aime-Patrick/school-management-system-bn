import { Injectable } from '@nestjs/common';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { Payment, paymentStatus } from 'src/schemas/payment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class PaymentService {
    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<Payment>
    ){}

    async recordPayment(dto: RecordPaymentDto): Promise<{ message: string; payment: Payment }> {
        try {
          const totalSoFar = await this.paymentModel.aggregate([
            { $match: { schoolId: new Types.ObjectId(dto.schoolId), status: 'approved' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]);
      
          const previousTotal = totalSoFar[0]?.total || 0;
      
          const payment = await this.paymentModel.create({
            ...dto,
            totalPayment: previousTotal + dto.amount,
          });
      
          return { message: "Payment recorded successfully", payment };
        } catch (error) {
          throw error;
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
