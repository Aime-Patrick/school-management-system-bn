import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result } from '../../schemas/result.schema';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';

@Injectable()
export class ResultService {
  constructor(@InjectModel('Result') private readonly resultModel: Model<Result>) {}

  // Create a new result
  async create(createResultDto: CreateResultDto): Promise<Result> {
    const totalScore = createResultDto.subjectResults.reduce((sum, sub) => sum + sub.score, 0);
    const maxTotalScore = createResultDto.subjectResults.reduce((sum, sub) => sum + sub.maxScore, 0);
    const percentage = (totalScore / maxTotalScore) * 100;

    const result = new this.resultModel({
      ...createResultDto,
      totalScore,
      percentage,
      remarks: this.generateRemarks(percentage),
    });
    
    return await result.save();
  }

  // Generate remarks based on percentage
  private generateRemarks(percentage: number): string {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Very Good';
    if (percentage >= 50) return 'Good';
    return 'Needs Improvement';
  }

  // Get all results with optional filters
  async findAll(classId?: string, examType?: string): Promise<Result[]> {
    const query: any = {};
    if (classId) query.class = classId;
    if (examType) query.examType = examType;
    
    return this.resultModel.find(query).populate('student class').exec();
  }

  // Get results for a single student
  async findOne(id: string): Promise<Result> {
    const result = await this.resultModel.findById(id).populate('student class').exec();
    if (!result) throw new NotFoundException('Result not found');
    return result;
  }

  // Update a result
  async update(id: string, updateResultDto: UpdateResultDto): Promise<Result> {
    const updatedResult = await this.resultModel.findByIdAndUpdate(id, updateResultDto, { new: true });
    if (!updatedResult) throw new NotFoundException('Result not found');
    return updatedResult;
  }

}
