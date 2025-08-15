import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeeStructure } from '../../../schemas/fee-structure.schema';
import { FeeCategory } from '../../../schemas/fee-category.schema';
import { CreateFeeStructureDto } from '../dto/create-fee-structure.dto';
import { QueryFeeStructuresDto } from '../dto/query-fees.dto';

@Injectable()
export class FeeStructureService {
  constructor(
    @InjectModel(FeeStructure.name) private feeStructureModel: Model<FeeStructure>,
    @InjectModel(FeeCategory.name) private feeCategoryModel: Model<FeeCategory>,
  ) {}

  async create(createFeeStructureDto: CreateFeeStructureDto): Promise<FeeStructure> {
    // Validate that fee category exists
    const feeCategory = await this.feeCategoryModel.findById(createFeeStructureDto.feeCategory).exec();
    if (!feeCategory) {
      throw new BadRequestException('Fee category not found');
    }

    // Check if fee structure already exists for this category, class, academic year, and term
    const existingStructure = await this.feeStructureModel.findOne({
      feeCategory: createFeeStructureDto.feeCategory,
      class: createFeeStructureDto.class,
      academicYear: createFeeStructureDto.academicYear,
      term: createFeeStructureDto.term,
      school: createFeeStructureDto.school,
    });

    if (existingStructure) {
      throw new BadRequestException('Fee structure already exists for this category, class, academic year, and term');
    }

    const feeStructure = new this.feeStructureModel({
      ...createFeeStructureDto,
      feeCategory: new Types.ObjectId(createFeeStructureDto.feeCategory),
      class: new Types.ObjectId(createFeeStructureDto.class),
      school: new Types.ObjectId(createFeeStructureDto.school),
      dueDate: createFeeStructureDto.dueDate ? new Date(createFeeStructureDto.dueDate) : undefined,
    });

    return await feeStructure.save();
  }

  async findAll(query: QueryFeeStructuresDto): Promise<{ data: FeeStructure[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, feeCategory, class: classId, school, academicYear, term, isActive } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (feeCategory) {
      filter.feeCategory = new Types.ObjectId(feeCategory);
    }

    if (classId) {
      filter.class = new Types.ObjectId(classId);
    }

    if (school) {
      filter.school = new Types.ObjectId(school);
    }

    if (academicYear) {
      filter.academicYear = academicYear;
    }

    if (term) {
      filter.term = term;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.feeStructureModel
        .find(filter)
        .populate('feeCategory', 'name frequency')
        .populate('class', 'name')
        .populate('school', 'name')
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
      .populate('feeCategory', 'name frequency')
      .populate('class', 'name')
      .populate('school', 'name')
      .exec();

    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }

    return feeStructure;
  }

  async update(id: string, updateFeeStructureDto: Partial<CreateFeeStructureDto>): Promise<FeeStructure> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid fee structure ID');
    }

    // Validate that fee category exists if being updated
    if (updateFeeStructureDto.feeCategory) {
      const feeCategory = await this.feeCategoryModel.findById(updateFeeStructureDto.feeCategory).exec();
      if (!feeCategory) {
        throw new BadRequestException('Fee category not found');
      }
    }

    // Check for duplicate fee structure if key fields are being updated
    if (updateFeeStructureDto.feeCategory || updateFeeStructureDto.class || updateFeeStructureDto.academicYear || updateFeeStructureDto.term) {
      const existingStructure = await this.feeStructureModel.findOne({
        feeCategory: updateFeeStructureDto.feeCategory || (await this.feeStructureModel.findById(id).exec())?.feeCategory,
        class: updateFeeStructureDto.class || (await this.feeStructureModel.findById(id).exec())?.class,
        academicYear: updateFeeStructureDto.academicYear || (await this.feeStructureModel.findById(id).exec())?.academicYear,
        term: updateFeeStructureDto.term || (await this.feeStructureModel.findById(id).exec())?.term,
        school: updateFeeStructureDto.school || (await this.feeStructureModel.findById(id).exec())?.school,
        _id: { $ne: id },
      });

      if (existingStructure) {
        throw new BadRequestException('Fee structure already exists for this category, class, academic year, and term');
      }
    }

    const updateData: any = { ...updateFeeStructureDto };
    
    if (updateFeeStructureDto.feeCategory) {
      updateData.feeCategory = new Types.ObjectId(updateFeeStructureDto.feeCategory);
    }
    
    if (updateFeeStructureDto.class) {
      updateData.class = new Types.ObjectId(updateFeeStructureDto.class);
    }
    
    if (updateFeeStructureDto.school) {
      updateData.school = new Types.ObjectId(updateFeeStructureDto.school);
    }

    if (updateFeeStructureDto.dueDate) {
      updateData.dueDate = new Date(updateFeeStructureDto.dueDate);
    }

    const feeStructure = await this.feeStructureModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('feeCategory', 'name frequency')
      .populate('class', 'name')
      .populate('school', 'name')
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

  async findByClassAndYear(classId: string, academicYear: string, term?: string): Promise<FeeStructure[]> {
    if (!Types.ObjectId.isValid(classId)) {
      throw new BadRequestException('Invalid class ID');
    }

    const filter: any = {
      class: new Types.ObjectId(classId),
      academicYear,
      isActive: true,
    };

    if (term) {
      filter.term = term;
    }

    return await this.feeStructureModel
      .find(filter)
      .populate('feeCategory', 'name frequency')
      .populate('class', 'name')
      .populate('school', 'name')
      .sort({ 'feeCategory.name': 1 })
      .exec();
  }

  async findBySchool(schoolId: string): Promise<FeeStructure[]> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new BadRequestException('Invalid school ID');
    }

    return await this.feeStructureModel
      .find({ school: new Types.ObjectId(schoolId), isActive: true })
      .populate('feeCategory', 'name frequency')
      .populate('class', 'name')
      .populate('school', 'name')
      .sort({ academicYear: -1, term: 1, 'feeCategory.name': 1 })
      .exec();
  }

  async calculateTotalFees(classId: string, academicYear: string, term?: string): Promise<number> {
    const feeStructures = await this.findByClassAndYear(classId, academicYear, term);
    
    return feeStructures.reduce((total, structure) => {
      const discountAmount = structure.discountAmount || 0;
      const discountPercentage = structure.discountPercentage || 0;
      const discountedAmount = structure.amount - discountAmount - (structure.amount * discountPercentage / 100);
      return total + Math.max(0, discountedAmount);
    }, 0);
  }
}
