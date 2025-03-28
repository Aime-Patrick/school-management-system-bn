import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Finance } from 'src/schemas/financial.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { School } from 'src/schemas/school.schema';
@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Finance.name) private paymentModel: Model<Finance>,
    @InjectModel(School.name) private schoolModel: Model<School>,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto, fileUrl: string, schoolAdmin:string): Promise<Finance> {
    const school = await this.schoolModel.findOne({ schoolAdmin });
    if (!school) {
      throw new NotFoundException('School not found');
    }
    const payment = new this.paymentModel({...createPaymentDto, receipt: fileUrl, school:school.id});
    return (await payment.save()).populate('school');
  }

  async getPayments(status?: string, date?: string, filterType?: 'daily' | 'weekly' | 'monthly'): Promise<Finance[]> {
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        if (filterType === 'daily') {
          filter.date = {
            $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
            $lte: new Date(parsedDate.setHours(23, 59, 59, 999)),
          };
        } else if (filterType === 'weekly') {
          const startOfWeek = new Date(parsedDate);
          startOfWeek.setDate(parsedDate.getDate() - parsedDate.getDay()); 
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          filter.date = {
            $gte: startOfWeek,
            $lte: endOfWeek,
          };
        } else if (filterType === 'monthly') {
          const startOfMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
          const endOfMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0);
          endOfMonth.setHours(23, 59, 59, 999);

          filter.date = {
            $gte: startOfMonth,
            $lte: endOfMonth,
          };
        }
      } else {
        throw new Error('Invalid date format');
      }
    }
    return await this.paymentModel.find(filter).populate("school").exec();
  }


  async getPaymentById(id: string): Promise<Finance> {
    const payment = await this.paymentModel.findById(id).populate("school").exec();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Finance> {
    const updatedPayment = await this.paymentModel.findByIdAndUpdate(id, updatePaymentDto, { new: true }).populate('school').exec();
    if (!updatedPayment) {
      throw new NotFoundException('Payment not found');
    }
    return updatedPayment;
  }

  async deletePayment(id: string): Promise<{ message: string }> {
    const result = await this.paymentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Payment not found');
    }
    return { message: 'Payment deleted successfully' };
  }
}
