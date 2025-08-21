import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeeCategory, FeeCategorySchema } from '../../../schemas/fee-category.schema';
import { CreateFeeCategoryDto } from '../dto/create-fee-category.dto';
import { QueryFeeCategoriesDto } from '../dto/query-fees.dto';

@Injectable()
export class FeeCategoryService {
  constructor(
    @InjectModel(FeeCategory.name) private feeCategoryModel: Model<FeeCategory>,
  ) {}

  async create(createFeeCategoryDto: CreateFeeCategoryDto, schoolId: string): Promise<FeeCategory> {
    // Check if fee category with same name already exists in the school
    const existingCategory = await this.feeCategoryModel.findOne({
      name: createFeeCategoryDto.name,
      school: new Types.ObjectId(schoolId),
    });

    if (existingCategory) {
      throw new BadRequestException('Fee category with this name already exists in the school');
    }

    const feeCategory = new this.feeCategoryModel({
      ...createFeeCategoryDto,
      school: new Types.ObjectId(schoolId),
    });

    return await feeCategory.save();
  }

  async findAll(query: QueryFeeCategoriesDto): Promise<{ data: FeeCategory[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, name, frequency, school, isActive } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (frequency) {
      filter.frequency = frequency;
    }

    if (school) {
      filter.school = new Types.ObjectId(school);
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.feeCategoryModel
        .find(filter)
        .populate('school', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.feeCategoryModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<FeeCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid fee category ID');
    }

    const feeCategory = await this.feeCategoryModel
      .findById(id)
      .populate('school', 'name')
      .exec();

    if (!feeCategory) {
      throw new NotFoundException('Fee category not found');
    }

    return feeCategory;
  }

  async update(id: string, updateFeeCategoryDto: Partial<CreateFeeCategoryDto>, schoolId?: string): Promise<FeeCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid fee category ID');
    }

    // Check if fee category with same name already exists in the school (excluding current category)
    if (updateFeeCategoryDto.name && schoolId) {
      const existingCategory = await this.feeCategoryModel.findOne({
        name: updateFeeCategoryDto.name,
        school: new Types.ObjectId(schoolId),
        _id: { $ne: id },
      });

      if (existingCategory) {
        throw new BadRequestException('Fee category with this name already exists in the school');
      }
    }

    const updateData: any = { ...updateFeeCategoryDto };
    if (schoolId) {
      updateData.school = new Types.ObjectId(schoolId);
    }

    const feeCategory = await this.feeCategoryModel
      .findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
      .populate('school', 'name')
      .exec();

    if (!feeCategory) {
      throw new NotFoundException('Fee category not found');
    }

    return feeCategory;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid fee category ID');
    }

    const feeCategory = await this.feeCategoryModel.findById(id).exec();

    if (!feeCategory) {
      throw new NotFoundException('Fee category not found');
    }

    // Check if fee category is being used in fee structures
    // This would require checking the fee structure collection
    // For now, we'll just delete the category

    await this.feeCategoryModel.findByIdAndDelete(id).exec();
  }

  async findBySchool(schoolId: string): Promise<FeeCategory[]> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new BadRequestException('Invalid school ID');
    }

    return await this.feeCategoryModel
      .find({ school: new Types.ObjectId(schoolId), isActive: true })
      .sort({ name: 1 })
      .exec();
  }

  async findActiveCategories(): Promise<FeeCategory[]> {
    return await this.feeCategoryModel
      .find({ isActive: true })
      .populate('school', 'name')
      .sort({ name: 1 })
      .exec();
  }
}
