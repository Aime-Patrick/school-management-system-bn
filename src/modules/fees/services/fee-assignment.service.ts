import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeeAssignment, AssignmentStatus } from '../../../schemas/fee-assignment.schema';
import { FeeStructure } from '../../../schemas/fee-structure.schema';
import { Student } from '../../../schemas/student.schema';
import { CreateFeeAssignmentDto } from '../dto/create-fee-assignment.dto';
import { QueryFeeAssignmentsDto } from '../dto/query-fees.dto';
import { AutoAssignFeesDto } from '../dto/auto-assign-fees.dto';
import { Class } from '../../../schemas/class.schema';

@Injectable()
export class FeeAssignmentService {
  constructor(
    @InjectModel(FeeAssignment.name) private feeAssignmentModel: Model<FeeAssignment>,
    @InjectModel(FeeStructure.name) private feeStructureModel: Model<FeeStructure>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(Class.name) private classModel: Model<Class>,
  ) {}

  async create(createFeeAssignmentDto: CreateFeeAssignmentDto): Promise<FeeAssignment> {
    // Validate that student exists
    const student = await this.studentModel.findById(createFeeAssignmentDto.student).exec();
    if (!student) {
      throw new BadRequestException('Student not found');
    }

    // Validate that fee structure exists
    const feeStructure = await this.feeStructureModel.findById(createFeeAssignmentDto.feeStructure).exec();
    if (!feeStructure) {
      throw new BadRequestException('Fee structure not found');
    }

    // Check if fee assignment already exists for this student and fee structure
    const existingAssignment = await this.feeAssignmentModel.findOne({
      student: createFeeAssignmentDto.student,
      feeStructure: createFeeAssignmentDto.feeStructure,
      status: { $ne: AssignmentStatus.COMPLETED },
    });

    if (existingAssignment) {
      throw new BadRequestException('Fee assignment already exists for this student and fee structure');
    }

    // Calculate assigned amount based on fee structure and discounts
    let assignedAmount = feeStructure.amount;
    
    if (createFeeAssignmentDto.discountAmount) {
      assignedAmount -= createFeeAssignmentDto.discountAmount;
    }
    
    if (createFeeAssignmentDto.discountPercentage) {
      assignedAmount -= (feeStructure.amount * createFeeAssignmentDto.discountPercentage / 100);
    }

    // Apply scholarship if provided
    if (createFeeAssignmentDto.scholarshipAmount) {
      assignedAmount -= createFeeAssignmentDto.scholarshipAmount;
    }

    // Ensure assigned amount is not negative
    assignedAmount = Math.max(0, assignedAmount);

    const feeAssignment = new this.feeAssignmentModel({
      ...createFeeAssignmentDto,
      student: new Types.ObjectId(createFeeAssignmentDto.student),
      feeAssignment: new Types.ObjectId(createFeeAssignmentDto.feeStructure),
      school: new Types.ObjectId(createFeeAssignmentDto.school),
      assignedBy: new Types.ObjectId(createFeeAssignmentDto.assignedBy),
      assignedAmount,
      assignedDate: new Date(),
      dueDate: createFeeAssignmentDto.dueDate ? new Date(createFeeAssignmentDto.dueDate) : feeStructure.dueDate,
    });

    return await feeAssignment.save();
  }

  async findAll(query: QueryFeeAssignmentsDto): Promise<{ data: FeeAssignment[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, student, feeStructure, school, status, dueDateFrom, dueDateTo } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (student) {
      filter.student = new Types.ObjectId(student);
    }

    if (feeStructure) {
      filter.feeStructure = new Types.ObjectId(feeStructure);
    }

    if (school) {
      filter.school = new Types.ObjectId(school);
    }

    if (status) {
      filter.status = status;
    }

    if (dueDateFrom || dueDateTo) {
      filter.dueDate = {};
      if (dueDateFrom) {
        filter.dueDate.$gte = new Date(dueDateFrom);
      }
      if (dueDateTo) {
        filter.dueDate.$lte = new Date(dueDateTo);
      }
    }

    const [data, total] = await Promise.all([
      this.feeAssignmentModel
        .find(filter)
        .populate('student', 'firstName lastName registrationNumber')
        .populate({
          path: 'feeStructure',
          populate: [
            { path: 'categoryId', select: 'name' },
            { path: 'classId', select: 'name' },
            { path: 'academicYearId', select: 'name' }
          ]
        })
        .populate('school', 'name')
        .populate('assignedBy', 'firstName lastName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.feeAssignmentModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<FeeAssignment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid fee assignment ID');
    }

    const feeAssignment = await this.feeAssignmentModel
      .findById(id)
      .populate('student', 'firstName lastName registrationNumber')
      .populate({
        path: 'feeStructure',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'classId', select: 'name' },
          { path: 'academicYearId', select: 'name' }
        ]
      })
      .populate('school', 'name')
      .populate('assignedBy', 'firstName lastName')
      .exec();

    if (!feeAssignment) {
      throw new NotFoundException('Fee assignment not found');
    }

    return feeAssignment;
  }

  async update(id: string, updateFeeAssignmentDto: Partial<CreateFeeAssignmentDto>): Promise<FeeAssignment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid fee assignment ID');
    }

    const feeAssignment = await this.feeAssignmentModel.findById(id).exec();
    if (!feeAssignment) {
      throw new NotFoundException('Fee assignment not found');
    }

    // Only allow updates for active assignments
    if (feeAssignment.status !== AssignmentStatus.ACTIVE) {
      throw new BadRequestException('Cannot update completed or inactive fee assignments');
    }

    const updateData: any = { ...updateFeeAssignmentDto };
    
    if (updateFeeAssignmentDto.student) {
      updateData.student = new Types.ObjectId(updateFeeAssignmentDto.student);
    }
    
    if (updateFeeAssignmentDto.feeStructure) {
      updateData.feeStructure = new Types.ObjectId(updateFeeAssignmentDto.feeStructure);
    }
    
    if (updateFeeAssignmentDto.school) {
      updateData.school = new Types.ObjectId(updateFeeAssignmentDto.school);
    }

    if (updateFeeAssignmentDto.assignedBy) {
      updateData.assignedBy = new Types.ObjectId(updateFeeAssignmentDto.assignedBy);
    }

    if (updateFeeAssignmentDto.dueDate) {
      updateData.dueDate = new Date(updateFeeAssignmentDto.dueDate);
    }

    // Recalculate assigned amount if discounts or scholarship changed
    if (updateFeeAssignmentDto.discountAmount !== undefined || 
        updateFeeAssignmentDto.discountPercentage !== undefined || 
        updateFeeAssignmentDto.scholarshipAmount !== undefined) {
      
      const feeStructure = await this.feeStructureModel.findById(feeAssignment.feeStructure).exec();
      if (feeStructure) {
        let newAssignedAmount = feeStructure.amount;
        
        const discountAmount = updateFeeAssignmentDto.discountAmount ?? feeAssignment.discountAmount;
        const discountPercentage = updateFeeAssignmentDto.discountPercentage ?? feeAssignment.discountPercentage;
        const scholarshipAmount = updateFeeAssignmentDto.scholarshipAmount ?? feeAssignment.scholarshipAmount;
        
        if (discountAmount) {
          newAssignedAmount -= discountAmount;
        }
        
        if (discountPercentage) {
          newAssignedAmount -= (feeStructure.amount * discountPercentage / 100);
        }

        if (scholarshipAmount) {
          newAssignedAmount -= scholarshipAmount;
        }

        updateData.assignedAmount = Math.max(0, newAssignedAmount);
      }
    }

    const updatedAssignment = await this.feeAssignmentModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('student', 'firstName lastName registrationNumber')
      .populate({
        path: 'feeStructure',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'classId', select: 'name' },
          { path: 'academicYearId', select: 'name' }
        ]
      })
      .populate('school', 'name')
      .populate('assignedBy', 'firstName lastName')
      .exec();

    if (!updatedAssignment) {
      throw new NotFoundException('Fee assignment not found after update');
    }

    return updatedAssignment;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid fee assignment ID');
    }

    const feeAssignment = await this.feeAssignmentModel.findById(id).exec();
    if (!feeAssignment) {
      throw new NotFoundException('Fee assignment not found');
    }

    // Only allow deletion of active assignments
    if (feeAssignment.status !== AssignmentStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete completed or inactive fee assignments');
    }

    await this.feeAssignmentModel.findByIdAndDelete(id).exec();
  }

  async findByStudent(studentId: string): Promise<FeeAssignment[]> {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('Invalid student ID');
    }

    return await this.feeAssignmentModel
      .find({ student: new Types.ObjectId(studentId) })
      .populate({
        path: 'feeStructure',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'classId', select: 'name' },
          { path: 'academicYearId', select: 'name' }
        ]
      })
      .populate('school', 'name')
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findBySchool(schoolId: string): Promise<FeeAssignment[]> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new BadRequestException('Invalid school ID');
    }

    return await this.feeAssignmentModel
      .find({ school: new Types.ObjectId(schoolId) })
      .populate('student', 'firstName lastName registrationNumber')
      .populate({
        path: 'feeStructure',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'classId', select: 'name' },
          { path: 'academicYearId', select: 'name' }
        ]
      })
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getOutstandingFees(schoolId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new BadRequestException('Invalid school ID');
    }

    const outstandingFees = await this.feeAssignmentModel.aggregate([
      {
        $match: {
          school: new Types.ObjectId(schoolId),
          status: AssignmentStatus.ACTIVE,
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      {
        $lookup: {
          from: 'feestructures',
          localField: 'feeStructure',
          foreignField: '_id',
          as: 'feeStructureInfo',
        },
      },
      {
        $unwind: '$studentInfo',
      },
      {
        $unwind: '$feeStructureInfo',
      },
      {
        $lookup: {
          from: 'feecategories',
          localField: 'feeStructureInfo.categoryId',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'feeStructureInfo.classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      {
        $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          studentName: { $concat: ['$studentInfo.firstName', ' ', '$studentInfo.lastName'] },
          registrationNumber: '$studentInfo.registrationNumber',
          feeCategory: '$categoryInfo.name',
          className: '$classInfo.name',
          assignedAmount: 1,
          dueDate: 1,
          status: 1,
          studentId: '$student',
          feeStructureId: '$feeStructure',
        },
      },
      {
        $sort: { dueDate: 1 },
      },
    ]);

    return outstandingFees;
  }

  // Debug method to test aggregation pipeline
  async debugOutstandingFees(schoolId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new BadRequestException('Invalid school ID');
    }

    // First, let's see what we have in the basic aggregation
    const debugResult = await this.feeAssignmentModel.aggregate([
      {
        $match: {
          school: new Types.ObjectId(schoolId),
          status: AssignmentStatus.ACTIVE,
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      {
        $lookup: {
          from: 'feestructures',
          localField: 'feeStructure',
          foreignField: '_id',
          as: 'feeStructureInfo',
        },
      },
      {
        $limit: 2, // Limit to 2 records for debugging
      },
    ]);

    return debugResult;
  }

  // Simple method to check if there are any fee assignments
  async checkFeeAssignments(schoolId: string): Promise<any> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new BadRequestException('Invalid school ID');
    }

    const totalAssignments = await this.feeAssignmentModel.countDocuments({ school: new Types.ObjectId(schoolId) });
    const activeAssignments = await this.feeAssignmentModel.countDocuments({ 
      school: new Types.ObjectId(schoolId), 
      status: AssignmentStatus.ACTIVE 
    });

    return {
      totalAssignments,
      activeAssignments,
      schoolId
    };
  }


  async markAsCompleted(id: string): Promise<FeeAssignment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid fee assignment ID');
    }

    const feeAssignment = await this.feeAssignmentModel.findById(id).exec();
    if (!feeAssignment) {
      throw new NotFoundException('Fee assignment not found');
    }

    if (feeAssignment.status !== AssignmentStatus.ACTIVE) {
      throw new BadRequestException('Fee assignment is not active');
    }

    const updatedAssignment = await this.feeAssignmentModel
      .findByIdAndUpdate(
        id,
        { status: AssignmentStatus.COMPLETED },
        { new: true, runValidators: true }
      )
      .populate('student', 'firstName lastName registrationNumber')
      .populate({
        path: 'feeStructure',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'classId', select: 'name' },
          { path: 'academicYearId', select: 'name' }
        ]
      })
      .populate('school', 'name')
      .populate('assignedBy', 'firstName lastName')
      .exec();

    if (!updatedAssignment) {
      throw new NotFoundException('Fee assignment not found after marking as completed');
    }

    return updatedAssignment;
  }

  async autoAssignFees(autoAssignDto: AutoAssignFeesDto, schoolId: string, assignedBy: string) {
    const { 
      feeStructureId, 
      studentId, 
      classIds, 
      studentIds, 
      assignToAllClasses, 
      assignToAllStudents,
      dueDate,
      sendNotification,
      notes 
    } = autoAssignDto;

    // Validate fee structure exists and belongs to school
    const feeStructure = await this.feeStructureModel.findOne({
      _id: new Types.ObjectId(feeStructureId),
      school: new Types.ObjectId(schoolId),
    }).populate('categoryId', 'name');
    
    if (!feeStructure) {
      throw new BadRequestException('Fee structure not found or does not belong to your school');
    }

    let targetStudentIds: string[] = [];

    if (studentId) {
      const student = await this.studentModel.findOne({
        _id: studentId,
        school: schoolId,
      });
      
      if (!student) {
        throw new BadRequestException('Student not found or does not belong to your school');
      }
      
      targetStudentIds = [studentId];
    } else {
      if (assignToAllClasses) {
        const allClasses = await this.classModel.find({ school: schoolId });
        const allClassIds = allClasses.map(c => (c as any)._id.toString());
        
        const allStudents = await this.studentModel.find({
          school: new Types.ObjectId(schoolId),
          class: { $in: allClassIds }
        });
        targetStudentIds = allStudents.map(s => s._id.toString());
      } else if (classIds && classIds.length > 0) {
        const studentsInClasses = await this.studentModel.find({
          school: new Types.ObjectId(schoolId),
          class: { $in: classIds }
        });
        
        targetStudentIds = studentsInClasses.map(s => s._id.toString());
      } else if (studentIds && studentIds.length > 0) {
        // Direct student assignment
        const students = await this.studentModel.find({
          _id: { $in: studentIds },
          school: schoolId,
        });
        
        targetStudentIds = students.map(s => s._id.toString());
      } else {
        throw new BadRequestException('Must specify either studentId, classIds, studentIds, or assignToAllClasses');
      }
    }

    // Remove duplicates
    targetStudentIds = [...new Set(targetStudentIds)];

    if (targetStudentIds.length === 0) {
      throw new BadRequestException('No students found for assignment');
    }

    // Create fee assignments
    const assignmentResults: Array<{
      studentId: string;
      status: 'created' | 'skipped';
      assignmentId?: string;
      reason?: string;
    }> = [];
    const createdAssignments: FeeAssignment[] = [];

    for (const studentId of targetStudentIds) {
      // Check if assignment already exists
      const existingAssignment = await this.feeAssignmentModel.findOne({
        student: studentId,
        feeStructure: feeStructureId,
        school: new Types.ObjectId(schoolId),
        status: { $ne: AssignmentStatus.COMPLETED },
      });

      if (existingAssignment) {
        assignmentResults.push({
          studentId,
          status: 'skipped',
          reason: 'Assignment already exists',
        });
        continue;
      }

      // Create new assignment
      const assignmentData = {
        student: new Types.ObjectId(studentId),
        feeStructure: new Types.ObjectId(feeStructureId),
        school: new Types.ObjectId(schoolId),
        assignedAmount: feeStructure.amount,
        assignedBy: new Types.ObjectId(assignedBy),
        assignedDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : feeStructure.dueDate,
        notes: notes || `Auto-assigned from ${
          typeof feeStructure.categoryId === 'object' && 'name' in (feeStructure.categoryId || {})
            ? (feeStructure.categoryId as any).name
            : 'Fee Category'
        }`,
        status: AssignmentStatus.ACTIVE,
      };

      const newAssignment = new this.feeAssignmentModel(assignmentData);
      const savedAssignment = await newAssignment.save();
      
      createdAssignments.push(savedAssignment);
      assignmentResults.push({
        studentId,
        status: 'created',
        assignmentId: (savedAssignment._id as Types.ObjectId).toString(),
      });

      // Send notification if requested
      if (sendNotification) {
        await this.sendFeeAssignmentNotification(savedAssignment);
      }
    }

    return {
      message: `Successfully assigned fees to ${createdAssignments.length} students`,
      assignedCount: createdAssignments.length,
      skippedCount: assignmentResults.filter(a => a.status === 'skipped').length,
      assignments: createdAssignments,
      details: assignmentResults,
    };
  }

  // Helper method for sending notifications
  private async sendFeeAssignmentNotification(assignment: FeeAssignment) {
    try {
      // Populate student and fee structure for notification
      const populatedAssignment = await this.feeAssignmentModel
        .findById(assignment._id)
        .populate('student', 'firstName lastName email')
        .populate({
          path: 'feeStructure',
          populate: [
            { path: 'categoryId', select: 'name' },
            { path: 'classId', select: 'name' },
            { path: 'academicYearId', select: 'name' }
          ]
        })
        .populate('school', 'name')
        .exec();

      if (populatedAssignment) {
        // TODO: Implement notification logic here
        // This could be email, SMS, or in-app notification
        // Example: await this.emailService.sendFeeAssignmentNotification(populatedAssignment);
      }
    } catch (error) {
      // Log error but don't fail the assignment creation
      console.error('Failed to send notification:', error);
    }
  }
}