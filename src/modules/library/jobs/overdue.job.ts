import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BorrowRecord, BorrowStatus } from '../borrow/schemas/borrow-record.schema';
// import { Fine } from '../fines/schemas/fine.schema'; // TODO: Uncomment when Fine schema is created
import { Book } from '../books/schemas/book.schema';
import { Member } from '../members/schemas/member.schema';

@Injectable()
export class OverdueJob {
  private readonly logger = new Logger(OverdueJob.name);

  constructor(
    @InjectModel(BorrowRecord.name) private borrowModel: Model<BorrowRecord>,
    // @InjectModel(Fine.name) private fineModel: Model<Fine>, // TODO: Uncomment when Fine schema is created
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(Member.name) private memberModel: Model<Member>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async markOverdueBooks() {
    this.logger.log('Starting overdue books check...');

    try {
      const overdueRecords = await this.borrowModel.find({
        status: BorrowStatus.ISSUED,
        dueDate: { $lt: new Date() },
      }).exec();

      this.logger.log(`Found ${overdueRecords.length} overdue books`);

      for (const record of overdueRecords) {
        await this.processOverdueRecord(record);
      }

      this.logger.log('Overdue books check completed successfully');
    } catch (error) {
      this.logger.error('Error processing overdue books:', error);
    }
  }

  private async processOverdueRecord(record: BorrowRecord) {
    try {
      // Calculate days overdue
      const daysLate = Math.ceil(
        (Date.now() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate fine amount (configurable daily rate)
      const dailyFineRate = Number(process.env.LIB_DAILY_FINE_RATE || 1); // Default $1 per day
      const fineAmount = daysLate * dailyFineRate;

      // Update borrow record status
      record.status = BorrowStatus.OVERDUE;
      record.daysOverdue = daysLate;
      record.fineAmount = fineAmount;
      await record.save();

      // TODO: Create fine record when Fine schema is implemented
      // await this.fineModel.create({
      //   memberId: record.memberId,
      //   bookId: record.bookId,
      //   borrowRecordId: record._id,
      //   type: 'OVERDUE',
      //   amount: fineAmount,
      //   status: 'UNPAID',
      // });

      // Update member overdue count and fine amount
      await this.memberModel.findByIdAndUpdate(record.memberId, {
        $inc: { 
          overdueCount: 1,
          fineAmount: fineAmount
        }
      }).exec();

      this.logger.log(
        `Marked book ${record.bookId} as overdue for member ${record.memberId}. Fine: $${fineAmount}`
      );
    } catch (error) {
      this.logger.error(
        `Error processing overdue record ${record._id}:`,
        error
      );
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async sendOverdueNotifications() {
    this.logger.log('Starting overdue notifications...');

    try {
      const overdueRecords = await this.borrowModel
        .find({ status: BorrowStatus.OVERDUE })
        .populate('memberId', 'firstName lastName email')
        .populate('bookId', 'title')
        .exec();

      for (const record of overdueRecords) {
        await this.sendOverdueNotification(record);
      }

      this.logger.log('Overdue notifications completed');
    } catch (error) {
      this.logger.error('Error sending overdue notifications:', error);
    }
  }

  private async sendOverdueNotification(record: any) {
    try {
      const member = record.memberId;
      const book = record.bookId;
      const daysOverdue = record.daysOverdue;
      const fineAmount = record.fineAmount;

      // Here you would integrate with your notification service
      // For now, we'll just log the notification
      this.logger.log(
        `NOTIFICATION: Member ${member.firstName} ${member.lastName} (${member.email}) ` +
        `has overdue book "${book.title}" for ${daysOverdue} days. Fine: $${fineAmount}`
      );

      // TODO: Integrate with email/SMS service
      // await this.notificationService.sendOverdueNotification({
      //   to: member.email,
      //   memberName: `${member.firstName} ${member.lastName}`,
      //   bookTitle: book.title,
      //   daysOverdue,
      //   fineAmount,
      //   dueDate: record.dueDate
      // });

    } catch (error) {
      this.logger.error(
        `Error sending overdue notification for record ${record._id}:`,
        error
      );
    }
  }

  @Cron('0 0 1 * *') // First day of every month at midnight
  async generateOverdueReport() {
    this.logger.log('Generating monthly overdue report...');

    try {
      const overdueStats = await this.borrowModel.aggregate([
        {
          $match: {
            status: BorrowStatus.OVERDUE,
            dueDate: {
              $lt: new Date(),
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
          }
        },
        {
          $group: {
            _id: null,
            totalOverdue: { $sum: 1 },
            totalFines: { $sum: '$fineAmount' },
            averageDaysOverdue: { $avg: '$daysOverdue' },
            maxDaysOverdue: { $max: '$daysOverdue' }
          }
        }
      ]);

      if (overdueStats.length > 0) {
        const stats = overdueStats[0];
        this.logger.log(
          `Monthly Overdue Report: ${stats.totalOverdue} overdue books, ` +
          `Total fines: $${stats.totalFines}, ` +
          `Average days overdue: ${Math.round(stats.averageDaysOverdue)}, ` +
          `Max days overdue: ${stats.maxDaysOverdue}`
        );
      } else {
        this.logger.log('No overdue books found for the month');
      }

    } catch (error) {
      this.logger.error('Error generating overdue report:', error);
    }
  }

  // TODO: Implement when Reservation schema is created
  // @Cron(CronExpression.EVERY_DAY_AT_6AM)
  // async cleanupExpiredReservations() {
  //   this.logger.log('Starting expired reservations cleanup...');
  //   // Implementation will be added when Reservation schema is created
  // }
}
