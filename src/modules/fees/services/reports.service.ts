import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeeAssignment, AssignmentStatus } from '../../../schemas/fee-assignment.schema';
import { FeePayment, PaymentStatus } from '../../../schemas/fee-payment.schema';
import { FeeStructure } from '../../../schemas/fee-structure.schema';
import { Student } from '../../../schemas/student.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(FeeAssignment.name) private feeAssignmentModel: Model<FeeAssignment>,
    @InjectModel(FeePayment.name) private paymentModel: Model<FeePayment>,
    @InjectModel(FeeStructure.name) private feeStructureModel: Model<FeeStructure>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
  ) {}

  async getOutstandingFeesReport(schoolId: string, classId?: string, academicYear?: string, term?: string): Promise<any> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new BadRequestException('Invalid school ID');
    }

    const matchStage: any = {
      school: new Types.ObjectId(schoolId),
      status: AssignmentStatus.ACTIVE,
    };

    if (classId) {
      matchStage['feeStructure.class'] = new Types.ObjectId(classId);
    }

    if (academicYear) {
      matchStage['feeStructure.academicYear'] = academicYear;
    }

    if (term) {
      matchStage['feeStructure.term'] = term;
    }

    const outstandingFees = await this.feeAssignmentModel.aggregate([
      {
        $lookup: {
          from: 'feestructures',
          localField: 'feeStructure',
          foreignField: '_id',
          as: 'feeStructure',
        },
      },
      {
        $unwind: '$feeStructure',
      },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $unwind: '$student',
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'feeAssignment',
          as: 'payments',
        },
      },
      {
        $match: matchStage,
      },
      {
        $addFields: {
          totalPaid: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$payments',
                    cond: { $eq: ['$$this.status', PaymentStatus.COMPLETED] },
                  },
                },
                as: 'payment',
                in: '$$payment.amount',
              },
            },
          },
        },
      },
      {
        $addFields: {
          outstandingAmount: { $subtract: ['$assignedAmount', '$totalPaid'] },
        },
      },
      {
        $match: {
          outstandingAmount: { $gt: 0 },
        },
      },
      {
        $project: {
          studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          registrationNumber: '$student.registrationNumber',
          className: '$feeStructure.class',
          feeCategory: '$feeStructure.feeCategory',
          assignedAmount: 1,
          totalPaid: 1,
          outstandingAmount: 1,
          dueDate: 1,
          daysOverdue: {
            $ceil: {
              $divide: [
                { $subtract: [new Date(), '$dueDate'] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $sort: { outstandingAmount: -1 },
      },
    ]);

    return {
      totalStudents: outstandingFees.length,
      totalOutstandingAmount: outstandingFees.reduce((sum, item) => sum + item.outstandingAmount, 0),
      averageOutstandingAmount: outstandingFees.length > 0 
        ? outstandingFees.reduce((sum, item) => sum + item.outstandingAmount, 0) / outstandingFees.length 
        : 0,
      data: outstandingFees,
    };
  }

  async getPaymentSummaryReport(schoolId: string, startDate?: Date, endDate?: Date): Promise<any> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new BadRequestException('Invalid school ID');
    }

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
      dailyBreakdown: {},
      monthlyBreakdown: {},
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

      // Daily breakdown
      const dateKey = payment.paymentDate.toISOString().split('T')[0];
      if (!summary.dailyBreakdown[dateKey]) {
        summary.dailyBreakdown[dateKey] = { count: 0, amount: 0 };
      }
      summary.dailyBreakdown[dateKey].count++;
      summary.dailyBreakdown[dateKey].amount += payment.amount;

      // Monthly breakdown
      const monthKey = payment.paymentDate.toISOString().substring(0, 7);
      if (!summary.monthlyBreakdown[monthKey]) {
        summary.monthlyBreakdown[monthKey] = { count: 0, amount: 0 };
      }
      summary.monthlyBreakdown[monthKey].count++;
      summary.monthlyBreakdown[monthKey].amount += payment.amount;

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

  async getDefaulterList(schoolId: string, daysOverdue: number = 30): Promise<any> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new BadRequestException('Invalid school ID');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

    const defaulters = await this.feeAssignmentModel.aggregate([
      {
        $lookup: {
          from: 'feestructures',
          localField: 'feeStructure',
          foreignField: '_id',
          as: 'feeStructure',
        },
      },
      {
        $unwind: '$feeStructure',
      },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $unwind: '$student',
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'feeAssignment',
          as: 'payments',
        },
      },
      {
        $match: {
          school: new Types.ObjectId(schoolId),
          status: AssignmentStatus.ACTIVE,
          dueDate: { $lt: cutoffDate },
        },
      },
      {
        $addFields: {
          totalPaid: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$payments',
                    cond: { $eq: ['$$this.status', PaymentStatus.COMPLETED] },
                  },
                },
                as: 'payment',
                in: '$$payment.amount',
              },
            },
          },
        },
      },
      {
        $addFields: {
          outstandingAmount: { $subtract: ['$assignedAmount', '$totalPaid'] },
        },
      },
      {
        $match: {
          outstandingAmount: { $gt: 0 },
        },
      },
      {
        $project: {
          studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          registrationNumber: '$student.registrationNumber',
          phoneNumber: '$student.phoneNumber',
          className: '$feeStructure.class',
          feeCategory: '$feeStructure.feeCategory',
          assignedAmount: 1,
          totalPaid: 1,
          outstandingAmount: 1,
          dueDate: 1,
          daysOverdue: {
            $ceil: {
              $divide: [
                { $subtract: [new Date(), '$dueDate'] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $sort: { daysOverdue: -1, outstandingAmount: -1 },
      },
    ]);

    return {
      totalDefaulters: defaulters.length,
      totalOutstandingAmount: defaulters.reduce((sum, item) => sum + item.outstandingAmount, 0),
      averageDaysOverdue: defaulters.length > 0 
        ? defaulters.reduce((sum, item) => sum + item.daysOverdue, 0) / defaulters.length 
        : 0,
      data: defaulters,
    };
  }

  async getStudentPaymentHistory(studentId: string): Promise<any> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('Invalid student ID');
    }

    const student = await this.studentModel.findById(studentId).exec();
    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const feeAssignments = await this.feeAssignmentModel
      .find({ student: new Types.ObjectId(studentId) })
      .populate('feeStructure')
      .populate('school', 'name')
      .exec();

    const payments = await this.paymentModel
      .find({ student: new Types.ObjectId(studentId) })
      .populate('feeAssignment')
      .sort({ paymentDate: -1 })
      .exec();

    const paymentHistory = feeAssignments.map(assignment => {
      // Ensure assignment._id is properly typed and converted to string
      const assignmentId = assignment._id?.toString() || '';
      const assignmentPayments = payments.filter(
        payment => payment.feeAssignment && payment.feeAssignment.toString() === assignmentId
      );

      const totalPaid = assignmentPayments
        .filter(payment => payment.status === PaymentStatus.COMPLETED)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const outstandingAmount = Math.max(0, assignment.assignedAmount - totalPaid);
      const paymentStatus = outstandingAmount === 0 ? 'Paid' : 'Outstanding';

      // Safely access populated fields with proper type checking
      const feeStructure = assignment.feeStructure as any; // Type assertion for populated fields

      return {
        feeCategory: feeStructure?.feeCategory || 'Unknown',
        className: feeStructure?.class || 'Unknown',
        academicYear: feeStructure?.academicYear || 'Unknown',
        term: feeStructure?.term || 'Unknown',
        assignedAmount: assignment.assignedAmount,
        totalPaid,
        outstandingAmount,
        paymentStatus,
        dueDate: assignment.dueDate,
        payments: assignmentPayments.map(payment => ({
          amount: payment.amount,
          paymentMode: payment.paymentMode,
          status: payment.status,
          paymentDate: payment.paymentDate,
          receiptNumber: payment.receiptNumber,
        })),
      };
    });

    return {
      student: {
        name: `${student.firstName} ${student.lastName}`,
        registrationNumber: student.registrationNumber,
        className: student.class,
      },
      summary: {
        totalAssignments: feeAssignments.length,
        totalAssignedAmount: feeAssignments.reduce((sum, item) => sum + item.assignedAmount, 0),
        totalPaidAmount: payments
          .filter(payment => payment.status === PaymentStatus.COMPLETED)
          .reduce((sum, payment) => sum + payment.amount, 0),
        totalOutstandingAmount: feeAssignments.reduce((sum, item) => {
          // Ensure item._id is a string for comparison with null safety
          const itemId = item._id?.toString() || '';
          const itemPayments = payments.filter(
            payment => payment.feeAssignment && payment.feeAssignment.toString() === itemId
          );
          const totalPaid = itemPayments
            .filter(payment => payment.status === PaymentStatus.COMPLETED)
            .reduce((sum, payment) => sum + payment.amount, 0);
          return sum + Math.max(0, item.assignedAmount - totalPaid);
        }, 0),
      },
      paymentHistory,
    };
  }

  async getFeeCollectionReport(schoolId: string, startDate?: Date, endDate?: Date, groupBy: 'day' | 'week' | 'month' = 'month'): Promise<any> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new BadRequestException('Invalid school ID');
    }

    const filter: any = { 
      school: new Types.ObjectId(schoolId),
      status: PaymentStatus.COMPLETED,
    };

    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) {
        filter.paymentDate.$gte = startDate;
      }
      if (endDate) {
        filter.paymentDate.$lte = endDate;
      }
    }

    let groupStage: any;
    if (groupBy === 'day') {
      groupStage = {
        $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' },
      };
    } else if (groupBy === 'week') {
      groupStage = {
        $dateToString: { format: '%Y-W%U', date: '$paymentDate' },
      };
    } else {
      groupStage = {
        $dateToString: { format: '%Y-%m', date: '$paymentDate' },
      };
    }

    const collectionReport = await this.paymentModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupStage,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          paymentModes: {
            $push: {
              mode: '$paymentMode',
              amount: '$amount',
            },
          },
        },
      },
      {
        $addFields: {
          period: '$_id',
          paymentModeBreakdown: {
            $reduce: {
              input: '$paymentModes',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $cond: {
                      if: { $in: ['$$this.mode', { $objectToArray: '$$value' }] },
                      then: {
                        $mergeObjects: [
                          { $arrayToObject: [[{ k: '$$this.mode', v: { $add: ['$$value.$$this.mode', '$$this.amount'] } }]] },
                          { $arrayToObject: [[{ k: '$$this.mode', v: { $add: ['$$value.$$this.mode', 1] } }]] },
                        ],
                      },
                      else: {
                        $mergeObjects: [
                          '$$value',
                          { $arrayToObject: [[{ k: '$$this.mode', v: '$$this.amount' }]] },
                          { $arrayToObject: [[{ k: '$$this.mode', v: 1 }]] },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          period: 1,
          totalPayments: 1,
          totalAmount: 1,
          paymentModeBreakdown: 1,
        },
      },
      { $sort: { period: 1 } },
    ]);

    return {
      totalPeriods: collectionReport.length,
      totalAmount: collectionReport.reduce((sum, item) => sum + item.totalAmount, 0),
      averageAmountPerPeriod: collectionReport.length > 0 
        ? collectionReport.reduce((sum, item) => sum + item.totalAmount, 0) / collectionReport.length 
        : 0,
      data: collectionReport,
    };
  }
}
