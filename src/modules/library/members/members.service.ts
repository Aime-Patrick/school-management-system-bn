import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Member, MemberRole, MemberStatus } from './schemas/member.schema';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<Member>,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    // Check if userId already exists
    const existingUser = await this.memberModel.findOne({ userId: createMemberDto.userId }).exec();
    if (existingUser) {
      throw new ConflictException('User is already a library member');
    }

    // Check if memberId already exists
    const existingMember = await this.memberModel.findOne({ memberId: createMemberDto.memberId }).exec();
    if (existingMember) {
      throw new ConflictException('Member ID already exists');
    }

    const memberData = {
      ...createMemberDto,
      school: createMemberDto.school ? new Types.ObjectId(createMemberDto.school) : undefined,
      joinDate: createMemberDto.joinDate ? new Date(createMemberDto.joinDate) : new Date(),
      expiryDate: createMemberDto.expiryDate ? new Date(createMemberDto.expiryDate) : undefined,
    };

    const member = new this.memberModel(memberData);
    return await member.save();
  }

  async findAll(query: any): Promise<{ data: Member[]; total: number; page: number; limit: number }> {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      status, 
      school,
      search,
      classOrDept 
    } = query;
    
    const skip = (page - 1) * limit;
    const filter: any = {};

    // Role filter
    if (role) {
      filter.role = role;
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // School filter
    if (school) {
      filter.school = new Types.ObjectId(school);
    }

    // Class/Department filter
    if (classOrDept) {
      filter.classOrDept = new RegExp(classOrDept, 'i');
    }

    // Text search
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { memberId: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const [data, total] = await Promise.all([
      this.memberModel
        .find(filter)
        .populate('school', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.memberModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Member> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid member ID');
    }

    const member = await this.memberModel
      .findById(id)
      .populate('school', 'name')
      .exec();

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async findByUserId(userId: string): Promise<Member> {
    const member = await this.memberModel
      .findOne({ userId })
      .populate('school', 'name')
      .exec();

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async findByMemberId(memberId: string): Promise<Member> {
    const member = await this.memberModel
      .findOne({ memberId })
      .populate('school', 'name')
      .exec();

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async update(id: string, updateMemberDto: any): Promise<Member> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid member ID');
    }

    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Check if memberId is being changed and if it already exists
    if (updateMemberDto.memberId && updateMemberDto.memberId !== member.memberId) {
      const existingMember = await this.memberModel.findOne({ memberId: updateMemberDto.memberId }).exec();
      if (existingMember) {
        throw new ConflictException('Member ID already exists');
      }
    }

    const updateData: any = { ...updateMemberDto };
    
    if (updateMemberDto.school) {
      updateData.school = new Types.ObjectId(updateMemberDto.school);
    }

    if (updateMemberDto.expiryDate) {
      updateData.expiryDate = new Date(updateMemberDto.expiryDate);
    }

    const updatedMember = await this.memberModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('school', 'name')
      .exec();

    if (!updatedMember) {
      throw new NotFoundException('Member not found after update');
    }

    return updatedMember;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid member ID');
    }

    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Check if member has borrowed books
    if (member.currentBorrowCount > 0) {
      throw new BadRequestException('Cannot delete member with borrowed books');
    }

    // Check if member has unpaid fines
    if (member.fineAmount > 0) {
      throw new BadRequestException('Cannot delete member with unpaid fines');
    }

    await this.memberModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(id: string, status: MemberStatus): Promise<Member> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid member ID');
    }

    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const updatedMember = await this.memberModel
      .findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
      .populate('school', 'name')
      .exec();

    if (!updatedMember) {
      throw new NotFoundException('Member not found after status update');
    }

    return updatedMember;
  }

  async incrementBorrowCount(memberId: string): Promise<void> {
    await this.memberModel.findByIdAndUpdate(memberId, {
      $inc: { 
        currentBorrowCount: 1,
        totalBorrowCount: 1
      }
    }).exec();
  }

  async decrementBorrowCount(memberId: string): Promise<void> {
    await this.memberModel.findByIdAndUpdate(memberId, {
      $inc: { currentBorrowCount: -1 }
    }).exec();
  }

  async incrementOverdueCount(memberId: string): Promise<void> {
    await this.memberModel.findByIdAndUpdate(memberId, {
      $inc: { overdueCount: 1 }
    }).exec();
  }

  async updateFineAmount(memberId: string, amount: number): Promise<void> {
    await this.memberModel.findByIdAndUpdate(memberId, {
      $inc: { fineAmount: amount }
    }).exec();
  }

  async getMembersByRole(role: MemberRole, schoolId?: string): Promise<Member[]> {
    const filter: any = { role };
    
    if (schoolId) {
      filter.school = new Types.ObjectId(schoolId);
    }

    return await this.memberModel
      .find(filter)
      .populate('school', 'name')
      .exec();
  }

  async getActiveMembers(schoolId?: string): Promise<Member[]> {
    const filter: any = { status: MemberStatus.ACTIVE };
    
    if (schoolId) {
      filter.school = new Types.ObjectId(schoolId);
    }

    return await this.memberModel
      .find(filter)
      .populate('school', 'name')
      .exec();
  }

  async getMembersWithOverdueBooks(schoolId?: string): Promise<Member[]> {
    const filter: any = { overdueCount: { $gt: 0 } };
    
    if (schoolId) {
      filter.school = new Types.ObjectId(schoolId);
    }

    return await this.memberModel
      .find(filter)
      .populate('school', 'name')
      .sort({ overdueCount: -1 })
      .exec();
  }

  async getMembersWithFines(schoolId?: string): Promise<Member[]> {
    const filter: any = { fineAmount: { $gt: 0 } };
    
    if (schoolId) {
      filter.school = new Types.ObjectId(schoolId);
    }

    return await this.memberModel
      .find(filter)
      .populate('school', 'name')
      .sort({ fineAmount: -1 })
      .exec();
  }

  async getMemberStatistics(schoolId?: string): Promise<any> {
    const filter: any = {};
    
    if (schoolId) {
      filter.school = new Types.ObjectId(schoolId);
    }

    const stats = await this.memberModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalMembers: { $sum: 1 },
          activeMembers: { $sum: { $cond: [{ $eq: ['$status', MemberStatus.ACTIVE] }, 1, 0] } },
          inactiveMembers: { $sum: { $cond: [{ $eq: ['$status', MemberStatus.INACTIVE] }, 1, 0] } },
          suspendedMembers: { $sum: { $cond: [{ $eq: ['$status', MemberStatus.SUSPENDED] }, 1, 0] } },
          students: { $sum: { $cond: [{ $eq: ['$role', MemberRole.STUDENT] }, 1, 0] } },
          teachers: { $sum: { $cond: [{ $eq: ['$role', MemberRole.TEACHER] }, 1, 0] } },
          staff: { $sum: { $cond: [{ $eq: ['$role', MemberRole.STAFF] }, 1, 0] } },
          librarians: { $sum: { $cond: [{ $eq: ['$role', MemberRole.LIBRARIAN] }, 1, 0] } },
          totalFines: { $sum: '$fineAmount' },
          averageFines: { $avg: '$fineAmount' },
          totalBorrows: { $sum: '$totalBorrowCount' },
          averageBorrows: { $avg: '$totalBorrowCount' },
        }
      }
    ]);

    return stats[0] || {
      totalMembers: 0,
      activeMembers: 0,
      inactiveMembers: 0,
      suspendedMembers: 0,
      students: 0,
      teachers: 0,
      staff: 0,
      librarians: 0,
      totalFines: 0,
      averageFines: 0,
      totalBorrows: 0,
      averageBorrows: 0,
    };
  }
}
