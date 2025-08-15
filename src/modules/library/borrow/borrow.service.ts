import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { BorrowRecord, BorrowStatus } from './schemas/borrow-record.schema';
import { Book, BookStatus } from '../books/schemas/book.schema';
import { Member, MemberStatus } from '../members/schemas/member.schema';
import { CreateBorrowDto } from './dto/create-borrow.dto';

@Injectable()
export class BorrowService {
  constructor(
    @InjectModel(BorrowRecord.name) private borrowModel: Model<BorrowRecord>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(Member.name) private memberModel: Model<Member>,
  ) {}

  async borrowBook(createBorrowDto: CreateBorrowDto, issuedBy?: string): Promise<BorrowRecord> {
    const session = await this.borrowModel.startSession();
    session.startTransaction();

    try {
      const { memberId, bookId, dueDate, school, note, borrowDays } = createBorrowDto;

      // Validate member
      const member = await this.memberModel.findById(memberId).session(session).exec();
      if (!member) {
        throw new NotFoundException('Member not found');
      }

      if (member.status !== MemberStatus.ACTIVE) {
        throw new BadRequestException('Member is not active');
      }

      // Check borrowing limits
      if (member.currentBorrowCount >= member.maxBorrowLimit) {
        throw new BadRequestException(`Member has reached borrowing limit of ${member.maxBorrowLimit} books`);
      }

      // Validate book
      const book = await this.bookModel.findById(bookId).session(session).exec();
      if (!book) {
        throw new NotFoundException('Book not found');
      }

      if (book.availableCopies <= 0) {
        throw new BadRequestException('Book is not available for borrowing');
      }

      if (book.status !== BookStatus.AVAILABLE) {
        throw new BadRequestException('Book is not available for borrowing');
      }

      // Calculate due date
      let calculatedDueDate: Date;
      if (borrowDays) {
        calculatedDueDate = new Date();
        calculatedDueDate.setDate(calculatedDueDate.getDate() + borrowDays);
      } else {
        calculatedDueDate = new Date(dueDate);
      }

      // Check if due date is in the future
      if (calculatedDueDate <= new Date()) {
        throw new BadRequestException('Due date must be in the future');
      }

      // Create borrow record
      const borrowRecord = new this.borrowModel({
        memberId: new Types.ObjectId(memberId),
        bookId: new Types.ObjectId(bookId),
        dueDate: calculatedDueDate,
        school: school ? new Types.ObjectId(school) : undefined,
        issuedBy: issuedBy ? new Types.ObjectId(issuedBy) : undefined,
        note,
        status: BorrowStatus.ISSUED,
      });

      const savedRecord = await borrowRecord.save({ session });

      // Update book availability
      await this.bookModel.findByIdAndUpdate(bookId, {
        $inc: { availableCopies: -1 }
      }).session(session).exec();

      // Update member borrow count
      await this.memberModel.findByIdAndUpdate(memberId, {
        $inc: { 
          currentBorrowCount: 1,
          totalBorrowCount: 1
        }
      }).session(session).exec();

      // Update book borrow count
      await this.bookModel.findByIdAndUpdate(bookId, {
        $inc: { borrowCount: 1 }
      }).session(session).exec();

      await session.commitTransaction();
      return savedRecord;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async returnBook(borrowRecordId: string, returnedTo?: string, notes?: string): Promise<BorrowRecord> {
    const session = await this.borrowModel.startSession();
    session.startTransaction();

    try {
      // Find borrow record
      const borrowRecord = await this.borrowModel.findById(borrowRecordId).session(session).exec();
      if (!borrowRecord) {
        throw new NotFoundException('Borrow record not found');
      }

      if (borrowRecord.status === BorrowStatus.RETURNED) {
        throw new BadRequestException('Book has already been returned');
      }

      // Calculate fine if overdue
      let fineAmount = 0;
      let daysOverdue = 0;

      if (borrowRecord.status === BorrowStatus.OVERDUE || new Date() > borrowRecord.dueDate) {
        const dueDate = new Date(borrowRecord.dueDate);
        const returnDate = new Date();
        daysOverdue = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue > 0) {
          const dailyFineRate = Number(process.env.LIB_DAILY_FINE_RATE || 1);
          fineAmount = daysOverdue * dailyFineRate;
        }
      }

      // Update borrow record
      const updatedRecord = await this.borrowModel.findByIdAndUpdate(
        borrowRecordId,
        {
          status: BorrowStatus.RETURNED,
          returnDate: new Date(),
          returnedTo: returnedTo ? new Types.ObjectId(returnedTo) : undefined,
          returnNotes: notes,
          fineAmount,
          daysOverdue,
        },
        { new: true, runValidators: true, session }
      ).exec();

      if (!updatedRecord) {
        throw new NotFoundException('Borrow record not found after update');
      }

      // Update book availability
      await this.bookModel.findByIdAndUpdate(borrowRecord.bookId, {
        $inc: { availableCopies: 1 }
      }).session(session).exec();

      // Update member borrow count
      await this.memberModel.findByIdAndUpdate(borrowRecord.memberId, {
        $inc: { currentBorrowCount: -1 }
      }).session(session).exec();

      // Update member fine amount if applicable
      if (fineAmount > 0) {
        await this.memberModel.findByIdAndUpdate(borrowRecord.memberId, {
          $inc: { fineAmount }
        }).session(session).exec();
      }

      await session.commitTransaction();
      return updatedRecord;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async renewBook(borrowRecordId: string, newDueDate?: string, renewedBy?: string): Promise<BorrowRecord> {
    const session = await this.borrowModel.startSession();
    session.startTransaction();

    try {
      // Find borrow record
      const borrowRecord = await this.borrowModel.findById(borrowRecordId).session(session).exec();
      if (!borrowRecord) {
        throw new NotFoundException('Borrow record not found');
      }

      if (borrowRecord.status !== BorrowStatus.ISSUED && borrowRecord.status !== BorrowStatus.OVERDUE) {
        throw new BadRequestException('Book cannot be renewed');
      }

      // Check if book has been renewed too many times
      const maxRenewals = Number(process.env.LIB_MAX_RENEWALS || 2);
      if (borrowRecord.renewalCount >= maxRenewals) {
        throw new BadRequestException(`Book has already been renewed ${maxRenewals} times`);
      }

      // Calculate new due date
      let calculatedNewDueDate: Date;
      if (newDueDate) {
        calculatedNewDueDate = new Date(newDueDate);
      } else {
        // Default renewal period
        const renewalDays = Number(process.env.LIB_RENEWAL_DAYS || 14);
        calculatedNewDueDate = new Date();
        calculatedNewDueDate.setDate(calculatedNewDueDate.getDate() + renewalDays);
      }

      // Check if new due date is in the future
      if (calculatedNewDueDate <= new Date()) {
        throw new BadRequestException('New due date must be in the future');
      }

      // Store original due date if this is the first renewal
      if (!borrowRecord.originalDueDate) {
        borrowRecord.originalDueDate = borrowRecord.dueDate;
      }

      // Update borrow record
      const updatedRecord = await this.borrowModel.findByIdAndUpdate(
        borrowRecordId,
        {
          dueDate: calculatedNewDueDate,
          status: BorrowStatus.ISSUED, // Reset to issued if it was overdue
          isRenewed: true,
          renewalCount: (borrowRecord.renewalCount || 0) + 1,
          fineAmount: 0, // Reset fine amount
          daysOverdue: 0, // Reset overdue days
        },
        { new: true, runValidators: true, session }
      ).exec();

      if (!updatedRecord) {
        throw new NotFoundException('Borrow record not found after update');
      }

      await session.commitTransaction();
      return updatedRecord;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async markBookAsLost(borrowRecordId: string, markedBy?: string, notes?: string): Promise<BorrowRecord> {
    const session = await this.borrowModel.startSession();
    session.startTransaction();

    try {
      // Find borrow record
      const borrowRecord = await this.borrowModel.findById(borrowRecordId).session(session).exec();
      if (!borrowRecord) {
        throw new NotFoundException('Borrow record not found');
      }

      if (borrowRecord.status === BorrowStatus.RETURNED) {
        throw new BadRequestException('Book has already been returned');
      }

      // Calculate replacement cost (you might want to make this configurable)
      const replacementCost = Number(process.env.LIB_REPLACEMENT_COST || 25);

      // Update borrow record
      const updatedRecord = await this.borrowModel.findByIdAndUpdate(
        borrowRecordId,
        {
          status: BorrowStatus.LOST,
          fineAmount: replacementCost,
          note: notes || 'Book marked as lost',
        },
        { new: true, runValidators: true, session }
      ).exec();

      if (!updatedRecord) {
        throw new NotFoundException('Borrow record not found after update');
      }

      // Update member fine amount
      await this.memberModel.findByIdAndUpdate(borrowRecord.memberId, {
        $inc: { fineAmount: replacementCost }
      }).session(session).exec();

      await session.commitTransaction();
      return updatedRecord;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async markBookAsDamaged(borrowRecordId: string, damageDescription: string, markedBy?: string): Promise<BorrowRecord> {
    const session = await this.borrowModel.startSession();
    session.startTransaction();

    try {
      // Find borrow record
      const borrowRecord = await this.borrowModel.findById(borrowRecordId).session(session).exec();
      if (!borrowRecord) {
        throw new NotFoundException('Borrow record not found');
      }

      if (borrowRecord.status === BorrowStatus.RETURNED) {
        throw new BadRequestException('Book has already been returned');
      }

      // Calculate damage cost (you might want to make this configurable)
      const damageCost = Number(process.env.LIB_DAMAGE_COST || 15);

      // Update borrow record
      const updatedRecord = await this.borrowModel.findByIdAndUpdate(
        borrowRecordId,
        {
          status: BorrowStatus.DAMAGED,
          fineAmount: damageCost,
          damageDescription,
          note: `Book marked as damaged: ${damageDescription}`,
        },
        { new: true, runValidators: true, session }
      ).exec();

      if (!updatedRecord) {
        throw new NotFoundException('Borrow record not found after update');
      }

      // Update member fine amount
      await this.memberModel.findByIdAndUpdate(borrowRecord.memberId, {
        $inc: { fineAmount: damageCost }
      }).session(session).exec();

      await session.commitTransaction();
      return updatedRecord;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findAll(query: any): Promise<{ data: BorrowRecord[]; total: number; page: number; limit: number }> {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      memberId, 
      bookId, 
      school,
      overdue,
      dateFrom,
      dateTo
    } = query;
    
    const skip = (page - 1) * limit;
    const filter: any = {};

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Member filter
    if (memberId) {
      filter.memberId = new Types.ObjectId(memberId);
    }

    // Book filter
    if (bookId) {
      filter.bookId = new Types.ObjectId(bookId);
    }

    // School filter
    if (school) {
      filter.school = new Types.ObjectId(school);
    }

    // Overdue filter
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $in: [BorrowStatus.ISSUED, BorrowStatus.OVERDUE] };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.borrowDate = {};
      if (dateFrom) {
        filter.borrowDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.borrowDate.$lte = new Date(dateTo);
      }
    }

    const [data, total] = await Promise.all([
      this.borrowModel
        .find(filter)
        .populate('memberId', 'firstName lastName memberId')
        .populate('bookId', 'title authors ISBN')
        .populate('school', 'name')
        .populate('issuedBy', 'firstName lastName')
        .populate('returnedTo', 'firstName lastName')
        .skip(skip)
        .limit(limit)
        .sort({ borrowDate: -1 })
        .exec(),
      this.borrowModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<BorrowRecord> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid borrow record ID');
    }

    const borrowRecord = await this.borrowModel
      .findById(id)
      .populate('memberId', 'firstName lastName memberId email')
      .populate('bookId', 'title authors ISBN category')
      .populate('school', 'name')
      .populate('issuedBy', 'firstName lastName')
      .populate('returnedTo', 'firstName lastName')
      .exec();

    if (!borrowRecord) {
      throw new NotFoundException('Borrow record not found');
    }

    return borrowRecord;
  }

  async findByMember(memberId: string): Promise<BorrowRecord[]> {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new BadRequestException('Invalid member ID');
    }

    return await this.borrowModel
      .find({ memberId: new Types.ObjectId(memberId) })
      .populate('bookId', 'title authors ISBN category')
      .populate('school', 'name')
      .sort({ borrowDate: -1 })
      .exec();
  }

  async findByBook(bookId: string): Promise<BorrowRecord[]> {
    if (!Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException('Invalid book ID');
    }

    return await this.borrowModel
      .find({ bookId: new Types.ObjectId(bookId) })
      .populate('memberId', 'firstName lastName memberId')
      .populate('school', 'name')
      .sort({ borrowDate: -1 })
      .exec();
  }

  async getOverdueRecords(schoolId?: string): Promise<BorrowRecord[]> {
    const filter: any = {
      dueDate: { $lt: new Date() },
      status: { $in: [BorrowStatus.ISSUED, BorrowStatus.OVERDUE] }
    };

    if (schoolId) {
      filter.school = new Types.ObjectId(schoolId);
    }

    return await this.borrowModel
      .find(filter)
      .populate('memberId', 'firstName lastName memberId email')
      .populate('bookId', 'title authors ISBN')
      .populate('school', 'name')
      .sort({ dueDate: 1 })
      .exec();
  }

  async getBorrowingStatistics(schoolId?: string, dateFrom?: string, dateTo?: string): Promise<any> {
    const filter: any = {};
    
    if (schoolId) {
      filter.school = new Types.ObjectId(schoolId);
    }

    if (dateFrom || dateTo) {
      filter.borrowDate = {};
      if (dateFrom) {
        filter.borrowDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.borrowDate.$lte = new Date(dateTo);
      }
    }

    const stats = await this.borrowModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBorrows: { $sum: 1 },
          totalReturns: { $sum: { $cond: [{ $eq: ['$status', BorrowStatus.RETURNED] }, 1, 0] } },
          totalOverdue: { $sum: { $cond: [{ $eq: ['$status', BorrowStatus.OVERDUE] }, 1, 0] } },
          totalLost: { $sum: { $cond: [{ $eq: ['$status', BorrowStatus.LOST] }, 1, 0] } },
          totalDamaged: { $sum: { $cond: [{ $eq: ['$status', BorrowStatus.DAMAGED] }, 1, 0] } },
          totalFines: { $sum: '$fineAmount' },
          averageBorrowDuration: { $avg: { $subtract: ['$returnDate', '$borrowDate'] } },
        }
      }
    ]);

    return stats[0] || {
      totalBorrows: 0,
      totalReturns: 0,
      totalOverdue: 0,
      totalLost: 0,
      totalDamaged: 0,
      totalFines: 0,
      averageBorrowDuration: 0,
    };
  }

  async getMemberBorrowingHistory(memberId: string): Promise<any> {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new BadRequestException('Invalid member ID');
    }

    const history = await this.borrowModel.aggregate([
      { $match: { memberId: new Types.ObjectId(memberId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalFines: { $sum: '$fineAmount' },
          averageDaysOverdue: { $avg: '$daysOverdue' },
        }
      }
    ]);

    return history;
  }
}
