import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeeStructure, FeeStatus } from '../../../schemas/fee-structure.schema';
import { FeeCategory } from '../../../schemas/fee-category.schema';
import { Class } from '../../../schemas/class.schema';
import { Academic } from '../../../schemas/academic-year.schema';
import { Term } from '../../../schemas/terms.schama';
import { CreateFeeStructureDto } from '../dto/create-fee-structure.dto';
import { QueryFeeStructuresDto } from '../dto/query-fees.dto';

@Injectable()
export class FeeStructureService {
  constructor(
    @InjectModel(FeeStructure.name) private feeStructureModel: Model<FeeStructure>,
    @InjectModel(FeeCategory.name) private feeCategoryModel: Model<FeeCategory>,
    @InjectModel(Class.name) private classModel: Model<Class>,
    @InjectModel(Academic.name) private academicModel: Model<Academic>,
    @InjectModel(Term.name) private termModel: Model<Term>,
  ) {}

  async create(createFeeStructureDto: CreateFeeStructureDto, schoolId: string): Promise<FeeStructure> {
    // Validate that fee category exists
    const feeCategory = await this.feeCategoryModel.findById(createFeeStructureDto.categoryId).exec();
    if (!feeCategory) {
      throw new BadRequestException('Fee category not found');
    }

    // Validate that class exists
    if (createFeeStructureDto.classId) {
      const classExists = await this.classModel.findById(createFeeStructureDto.classId).exec();
      if (!classExists) {
        throw new BadRequestException('Class not found');
      }
    }

    // Validate that academic year exists
    const academicYearExists = await this.academicModel.findById(createFeeStructureDto.academicYearId).exec();
    if (!academicYearExists) {
      throw new BadRequestException('Academic year not found');
    }

    // Validate that term exists
    const termExists = await this.termModel.findById(createFeeStructureDto.termId).exec();
    if (!termExists) {
      throw new BadRequestException('Term not found');
    }

    // Check if fee structure already exists for this category, class, academic year, and term
    const existingStructure = await this.feeStructureModel.findOne({
      categoryId: createFeeStructureDto.categoryId,
      classId: createFeeStructureDto.classId,
      academicYearId: createFeeStructureDto.academicYearId,
      termId: createFeeStructureDto.termId,
      school: new Types.ObjectId(schoolId),
    });

    if (existingStructure) {
      throw new BadRequestException('Fee structure already exists for this category, class, academic year, and term');
    }

    const feeStructureData: any = {
      ...createFeeStructureDto,
      categoryId: new Types.ObjectId(createFeeStructureDto.categoryId),
      classId: new Types.ObjectId(createFeeStructureDto.classId),
      academicYearId: new Types.ObjectId(createFeeStructureDto.academicYearId),
      termId: new Types.ObjectId(createFeeStructureDto.termId),
      school: new Types.ObjectId(schoolId),
      status: createFeeStructureDto.status || FeeStatus.ACTIVE,
      dueDate: createFeeStructureDto.dueDate ? new Date(createFeeStructureDto.dueDate) : undefined,
    };

    // Handle lateFeeRules if provided
    if (createFeeStructureDto.lateFeeRules) {
      feeStructureData.lateFeeRules = createFeeStructureDto.lateFeeRules;
    }

    // Handle legacy fields for backward compatibility
    if (createFeeStructureDto.isActive !== undefined) {
      feeStructureData.isActive = createFeeStructureDto.isActive;
    }
    if (createFeeStructureDto.lateFeeAmount !== undefined) {
      feeStructureData.lateFeeAmount = createFeeStructureDto.lateFeeAmount;
    }
    if (createFeeStructureDto.lateFeePercentage !== undefined) {
      feeStructureData.lateFeePercentage = createFeeStructureDto.lateFeePercentage;
    }
    if (createFeeStructureDto.gracePeriodDays !== undefined) {
      feeStructureData.gracePeriodDays = createFeeStructureDto.gracePeriodDays;
    }

    const feeStructure = new this.feeStructureModel(feeStructureData);
    return await feeStructure.save();
  }

  async findAll(query: QueryFeeStructuresDto, schoolId?: string): Promise<{ data: FeeStructure[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, categoryId, classId, academicYearId, termId, status, isActive } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Use schoolId from authenticated user if not specified in query
    if (schoolId) {
      filter.school = new Types.ObjectId(schoolId);
    }

    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    if (classId) {
      filter.classId = new Types.ObjectId(classId);
    }

    if (academicYearId) {
      filter.academicYearId = new Types.ObjectId(academicYearId);
    }

    if (termId) {
      filter.termId = new Types.ObjectId(termId);
    }

    // Handle both new status and legacy isActive fields
    if (status !== undefined) {
      filter.status = status;
    } else if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.feeStructureModel
        .find(filter)
        .populate('categoryId', 'name frequency')
        .populate('classId', 'name')
        .populate('school', 'name')
        .populate('academicYearId', 'name')
        .populate('termId', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.feeStructureModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<FeeStructure> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid fee structure ID');
    }

    const feeStructure = await this.feeStructureModel
      .findById(id)
      .populate('categoryId', 'name frequency')
      .populate('classId', 'name')
      .populate('school', 'name')
      .populate('academicYearId', 'name')
      .populate('termId', 'name')
      .exec();

    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }

    return feeStructure;
  }

  async update(id: string, updateFeeStructureDto: Partial<CreateFeeStructureDto>, schoolId?: string): Promise<FeeStructure> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid fee structure ID');
    }

    // Validate that fee category exists if being updated
    if (updateFeeStructureDto.categoryId) {
      const feeCategory = await this.feeCategoryModel.findById(updateFeeStructureDto.categoryId).exec();
      if (!feeCategory) {
        throw new BadRequestException('Fee category not found');
      }
    }

    // Check for duplicate fee structure if key fields are being updated
    if (updateFeeStructureDto.categoryId || updateFeeStructureDto.classId || updateFeeStructureDto.academicYearId || updateFeeStructureDto.termId) {
      const currentStructure = await this.feeStructureModel.findById(id).exec();
      if (!currentStructure) {
        throw new NotFoundException('Fee structure not found');
      }

      const existingStructure = await this.feeStructureModel.findOne({
        categoryId: updateFeeStructureDto.categoryId || currentStructure.categoryId,
        classId: updateFeeStructureDto.classId || currentStructure.classId,
        academicYearId: updateFeeStructureDto.academicYearId || currentStructure.academicYearId,
        termId: updateFeeStructureDto.termId || currentStructure.termId,
        school: schoolId ? new Types.ObjectId(schoolId) : currentStructure.school,
        _id: { $ne: id },
      });

      if (existingStructure) {
        throw new BadRequestException('Fee structure already exists for this category, class, academic year, and term');
      }
    }

    const updateData: any = { ...updateFeeStructureDto };
    
    if (updateFeeStructureDto.categoryId) {
      updateData.categoryId = new Types.ObjectId(updateFeeStructureDto.categoryId);
    }
    
    if (updateFeeStructureDto.classId) {
      updateData.classId = new Types.ObjectId(updateFeeStructureDto.classId);
    }
    
    if (updateFeeStructureDto.academicYearId) {
      updateData.academicYearId = new Types.ObjectId(updateFeeStructureDto.academicYearId);
    }
    
    if (updateFeeStructureDto.termId) {
      updateData.termId = new Types.ObjectId(updateFeeStructureDto.termId);
    }

    if (updateFeeStructureDto.dueDate) {
      updateData.dueDate = new Date(updateFeeStructureDto.dueDate);
    }

    // Handle lateFeeRules if provided
    if (updateFeeStructureDto.lateFeeRules) {
      updateData.lateFeeRules = updateFeeStructureDto.lateFeeRules;
    }

    // Handle legacy fields for backward compatibility
    if (updateFeeStructureDto.isActive !== undefined) {
      updateData.isActive = updateFeeStructureDto.isActive;
    }
    if (updateFeeStructureDto.lateFeeAmount !== undefined) {
      updateData.lateFeeAmount = updateFeeStructureDto.lateFeeAmount;
    }
    if (updateFeeStructureDto.lateFeePercentage !== undefined) {
      updateData.lateFeePercentage = updateFeeStructureDto.lateFeePercentage;
    }
    if (updateFeeStructureDto.gracePeriodDays !== undefined) {
      updateData.gracePeriodDays = updateFeeStructureDto.gracePeriodDays;
    }

    const feeStructure = await this.feeStructureModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('categoryId', 'name frequency')
      .populate('classId', 'name')
      .populate('school', 'name')
      .populate('academicYearId', 'name')
      .populate('termId', 'name')
      .exec();

    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }

    return feeStructure;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid fee structure ID');
    }

    const feeStructure = await this.feeStructureModel.findById(id).exec();

    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }

    // Check if fee structure is being used in fee assignments
    // This would require checking the fee assignment collection
    // For now, we'll just delete the structure

    await this.feeStructureModel.findByIdAndDelete(id).exec();
  }

  async findByClassAndYear(classId: string, academicYearId: string, termId?: string): Promise<FeeStructure[]> {
    if (!Types.ObjectId.isValid(classId)) {
      throw new BadRequestException('Invalid class ID');
    }

    if (!Types.ObjectId.isValid(academicYearId)) {
      throw new BadRequestException('Invalid academic year ID');
    }

    const filter: any = {
      classId: new Types.ObjectId(classId),
      academicYearId: new Types.ObjectId(academicYearId),
      status: FeeStatus.ACTIVE,
    };

    if (termId) {
      if (!Types.ObjectId.isValid(termId)) {
        throw new BadRequestException('Invalid term ID');
      }
      filter.termId = new Types.ObjectId(termId);
    }

    return await this.feeStructureModel
      .find(filter)
      .populate('categoryId', 'name frequency')
      .populate('classId', 'name')
      .populate('school', 'name')
      .populate('academicYearId', 'name')
      .populate('termId', 'name')
      .sort({ 'categoryId.name': 1 })
      .exec();
  }

  async findBySchool(schoolId: string): Promise<FeeStructure[]> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new BadRequestException('Invalid school ID');
    }

    return await this.feeStructureModel
      .find({ school: new Types.ObjectId(schoolId), status: FeeStatus.ACTIVE })
      .populate('categoryId', 'name frequency')
      .populate('classId', 'name')
      .populate('school', 'name')
      .populate('academicYearId', 'name')
      .populate('termId', 'name')
      .sort({ 'academicYearId.name': -1, 'termId.name': 1, 'categoryId.name': 1 })
      .exec();
  }

  async calculateTotalFees(classId: string, academicYearId: string, termId?: string): Promise<number> {
    const feeStructures = await this.findByClassAndYear(classId, academicYearId, termId);
    
    return feeStructures.reduce((total, structure) => {
      const discountAmount = structure.discountAmount || 0;
      const discountPercentage = structure.discountPercentage || 0;
      const discountedAmount = structure.amount - discountAmount - (structure.amount * discountPercentage / 100);
      return total + Math.max(0, discountedAmount);
    }, 0);
  }
}
