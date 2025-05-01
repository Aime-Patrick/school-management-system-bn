import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudentPayment } from 'src/schemas/student-payment';
import { CreateStudentPaymentDto } from './dto/record-student-payment.dto';
import { paymentStatus } from 'src/schemas/student-payment';

@Injectable()
export class StudentPaymentService {
  constructor(
    @InjectModel(StudentPayment.name) private readonly studentPaymentModel: Model<StudentPayment>,
  ) {}

  // Create a new student payment
  async createStudentPayment(dto: CreateStudentPaymentDto, school:string): Promise<{ message: string; payment: StudentPayment }> {
    try {
      const payment = await this.studentPaymentModel.create({...dto, schoolId: school});
      return { message: 'Student payment created successfully', payment };
    } catch (error) {
      throw new BadRequestException('Failed to create student payment');
    }
  }

  // Get all student payments
  async getAllStudentPayments(school:string): Promise<StudentPayment[]> {
    try {
      return await this.studentPaymentModel
        .find({schoolId: school})
        .populate('schoolId', 'schoolName')
        .populate('studentId', 'firstName lastName')
        .populate('termId', 'name')
        .populate('academicId', 'name')
        .exec();
    } catch (error) {
      throw new NotFoundException('Failed to retrieve student payments');
    }
  }

  // Update the status of a student payment
  async updateStudentPaymentStatus(paymentId: string, status: paymentStatus): Promise<{ message: string; payment: StudentPayment }> {
    try {
      const payment = await this.studentPaymentModel.findById(paymentId);

      if (!payment) {
        throw new NotFoundException('Student payment not found');
      }

      if (payment.status === status) {
        throw new BadRequestException(`Payment is already ${status}`);
      }

      payment.status = status;
      await payment.save();

      const message = status === paymentStatus.PAID
        ? 'Student payment marked as paid successfully'
        : 'Student payment marked as unpaid successfully';

      return { message, payment };
    } catch (error) {
      throw error;
    }
  }

  
}