import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { FeePayment, PaymentStatus, PaymentMode } from '../../../schemas/fee-payment.schema';
import { FeeAssignment } from '../../../schemas/fee-assignment.schema';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { QueryPaymentsDto } from '../dto/query-fees.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(FeePayment.name) private paymentModel: Model<FeePayment>,
    @InjectModel(FeeAssignment.name) private feeAssignmentModel: Model<FeeAssignment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<FeePayment> {
    // Validate that fee assignment exists
    const feeAssignment = await this.feeAssignmentModel.findById(createPaymentDto.feeAssignment).exec();
    if (!feeAssignment) {
      throw new BadRequestException('Fee assignment not found');
    }

    // Check if payment amount exceeds the assigned amount
    if (createPaymentDto.amount > feeAssignment.assignedAmount) {
      throw new BadRequestException('Payment amount cannot exceed the assigned fee amount');
    }

    // Generate receipt number if not provided
    if (!createPaymentDto.receiptNumber) {
      createPaymentDto.receiptNumber = await this.generateReceiptNumber();
    }

    // Generate reference number if not provided
    if (!createPaymentDto.referenceNumber) {
      createPaymentDto.referenceNumber = await this.generateReferenceNumber();
    }

    const payment = new this.paymentModel({
      ...createPaymentDto,
      student: new Types.ObjectId(createPaymentDto.student),
      feeAssignment: new Types.ObjectId(createPaymentDto.feeAssignment),
      school: new Types.ObjectId(createPaymentDto.school),
      recordedBy: new Types.ObjectId(createPaymentDto.recordedBy),
      paymentDate: new Date(createPaymentDto.paymentDate),
    });

    return await payment.save();
  }

  async findAll(query: QueryPaymentsDto): Promise<{ data: FeePayment[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, student, feeAssignment, school, status, paymentMode, paymentDateFrom, paymentDateTo, amountFrom, amountTo } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (student) {
      filter.student = new Types.ObjectId(student);
    }

    if (feeAssignment) {
      filter.feeAssignment = new Types.ObjectId(feeAssignment);
    }

    if (school) {
      filter.school = new Types.ObjectId(school);
    }

    if (status) {
      filter.status = status;
    }

    if (paymentMode) {
      filter.paymentMode = paymentMode;
    }

    if (paymentDateFrom || paymentDateTo) {
      filter.paymentDate = {};
      if (paymentDateFrom) {
        filter.paymentDate.$gte = new Date(paymentDateFrom);
      }
      if (paymentDateTo) {
        filter.paymentDate.$lte = new Date(paymentDateTo);
      }
    }

    if (amountFrom || amountTo) {
      filter.amount = {};
      if (amountFrom) {
        filter.amount.$gte = amountFrom;
      }
      if (amountTo) {
        filter.amount.$lte = amountTo;
      }
    }

    const [data, total] = await Promise.all([
      this.paymentModel
        .find(filter)
        .populate('student', 'firstName lastName registrationNumber')
        .populate('feeAssignment')
        .populate('school', 'name')
        .populate('recordedBy', 'firstName lastName')
        .populate('approvedBy', 'firstName lastName')
        .populate('refundedBy', 'firstName lastName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.paymentModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<FeePayment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    const payment = await this.paymentModel
      .findById(id)
      .populate('student', 'firstName lastName registrationNumber')
      .populate('feeAssignment')
      .populate('school', 'name')
      .populate('recordedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('refundedBy', 'firstName lastName')
      .exec();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: Partial<CreatePaymentDto>): Promise<FeePayment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Only allow updates for pending payments
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Cannot update completed, failed, or cancelled payments');
    }

    const updateData: any = { ...updatePaymentDto };
    
    if (updatePaymentDto.student) {
      updateData.student = new Types.ObjectId(updatePaymentDto.student);
    }
    
    if (updatePaymentDto.feeAssignment) {
      updateData.feeAssignment = new Types.ObjectId(updatePaymentDto.feeAssignment);
    }
    
    if (updatePaymentDto.school) {
      updateData.school = new Types.ObjectId(updatePaymentDto.school);
    }

    if (updatePaymentDto.recordedBy) {
      updateData.recordedBy = new Types.ObjectId(updatePaymentDto.recordedBy);
    }

    if (updatePaymentDto.paymentDate) {
      updateData.paymentDate = new Date(updatePaymentDto.paymentDate);
    }

    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('student', 'firstName lastName registrationNumber')
      .populate('feeAssignment')
      .populate('school', 'name')
      .populate('recordedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('refundedBy', 'firstName lastName')
      .exec();

    if (!updatedPayment) {
      throw new NotFoundException('Payment not found after update');
    }

    return updatedPayment;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Only allow deletion of pending payments
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Cannot delete completed, failed, or cancelled payments');
    }

    await this.paymentModel.findByIdAndDelete(id).exec();
  }

  async approvePayment(id: string, approvedBy: string): Promise<FeePayment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(
        id,
        {
          status: PaymentStatus.COMPLETED,
          approvedBy: new Types.ObjectId(approvedBy),
          approvedAt: new Date(),
        },
        { new: true, runValidators: true }
      )
      .populate('student', 'firstName lastName registrationNumber')
      .populate('feeAssignment')
      .populate('school', 'name')
      .populate('recordedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('refundedBy', 'firstName lastName')
      .exec();

    if (!updatedPayment) {
      throw new NotFoundException('Payment not found after approval');
    }

    return updatedPayment;
  }

  async rejectPayment(id: string, approvedBy: string, reason: string): Promise<FeePayment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(
        id,
        {
          status: PaymentStatus.FAILED,
          approvedBy: new Types.ObjectId(approvedBy),
          approvedAt: new Date(),
          failureReason: reason,
        },
        { new: true, runValidators: true }
      )
      .populate('student', 'firstName lastName registrationNumber')
      .populate('feeAssignment')
      .populate('school', 'name')
      .populate('recordedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('refundedBy', 'firstName lastName')
      .exec();

    if (!updatedPayment) {
      throw new NotFoundException('Payment not found after rejection');
    }

    return updatedPayment;
  }

  async processRefund(
    id: string,
    refundAmount: number,
    refundReason: string,
    refundedBy: string,
    refundNotes?: string
  ): Promise<FeePayment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    if (refundAmount > payment.amount) {
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    const newStatus = refundAmount === payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(
        id,
        {
          status: newStatus,
          refundAmount,
          refundDate: new Date(),
          refundReason,
          refundedBy: new Types.ObjectId(refundedBy),
          refundNotes,
        },
        { new: true, runValidators: true }
      )
      .populate('student', 'firstName lastName registrationNumber')
      .populate('feeAssignment')
      .populate('school', 'name')
      .populate('recordedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('refundedBy', 'firstName lastName')
      .exec();

    if (!updatedPayment) {
      throw new NotFoundException('Payment not found after refund processing');
    }

    return updatedPayment;
  }

  async findByStudent(studentId: string): Promise<FeePayment[]> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('Invalid student ID');
    }

    return await this.paymentModel
      .find({ student: new Types.ObjectId(studentId) })
      .populate('feeAssignment')
      .populate('school', 'name')
      .populate('recordedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('refundedBy', 'firstName lastName')
      .sort({ paymentDate: -1 })
      .exec();
  }

  async findByFeeAssignment(feeAssignmentId: string): Promise<FeePayment[]> {
    if (!Types.ObjectId.isValid(feeAssignmentId)) {
      throw new BadRequestException('Invalid fee assignment ID');
    }

    return await this.paymentModel
      .find({ feeAssignment: new Types.ObjectId(feeAssignmentId) })
      .populate('student', 'firstName lastName registrationNumber')
      .populate('school', 'name')
      .populate('recordedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('refundedBy', 'firstName lastName')
      .sort({ paymentDate: -1 })
      .exec();
  }

  async getPaymentSummary(schoolId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const filter: any = { school: new Types.ObjectId(schoolId) };

    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) {
        filter.paymentDate.$gte = startDate;
      }
      if (endDate) {
        filter.paymentDate.$lte = endDate;
      }
    }

    const payments = await this.paymentModel.find(filter).exec();

    const summary = {
      totalPayments: payments.length,
      totalAmount: 0,
      completedAmount: 0,
      pendingAmount: 0,
      failedAmount: 0,
      refundedAmount: 0,
      paymentModeBreakdown: {},
      statusBreakdown: {},
    };

    payments.forEach(payment => {
      summary.totalAmount += payment.amount;

      // Status breakdown
      if (!summary.statusBreakdown[payment.status]) {
        summary.statusBreakdown[payment.status] = { count: 0, amount: 0 };
      }
      summary.statusBreakdown[payment.status].count++;
      summary.statusBreakdown[payment.status].amount += payment.amount;

      // Payment mode breakdown
      if (!summary.paymentModeBreakdown[payment.paymentMode]) {
        summary.paymentModeBreakdown[payment.paymentMode] = { count: 0, amount: 0 };
      }
      summary.paymentModeBreakdown[payment.paymentMode].count++;
      summary.paymentModeBreakdown[payment.paymentMode].amount += payment.amount;

      // Amount by status
      switch (payment.status) {
        case PaymentStatus.COMPLETED:
          summary.completedAmount += payment.amount;
          break;
        case PaymentStatus.PENDING:
          summary.pendingAmount += payment.amount;
          break;
        case PaymentStatus.FAILED:
          summary.failedAmount += payment.amount;
          break;
        case PaymentStatus.REFUNDED:
        case PaymentStatus.PARTIALLY_REFUNDED:
          summary.refundedAmount += payment.amount;
          break;
      }
    });

    return summary;
  }

  private async generateReceiptNumber(): Promise<string> {
    const count = await this.paymentModel.countDocuments();
    return `RCPT${String(count + 1).padStart(6, '0')}`;
  }

  private async generateReferenceNumber(): Promise<string> {
    const count = await this.paymentModel.countDocuments();
    return `REF${String(count + 1).padStart(6, '0')}`;
  }
}
