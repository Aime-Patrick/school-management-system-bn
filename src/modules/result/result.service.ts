import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Result } from '../../schemas/result.schema';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { Student } from 'src/schemas/student.schema';
import { ClassCombination } from 'src/schemas/ClassCombination.schema';

@Injectable()
export class ResultService {
  constructor(@InjectModel(Result.name) private readonly resultModel: Model<Result>,
  @InjectModel(Student.name) private readonly studentModel: Model<Student>,
  @InjectModel(ClassCombination.name) private readonly classModel: Model<ClassCombination>,
) {}

  // Create a new result
  async createResult(createResultDto: CreateResultDto): Promise<Result> {
    const { student, subjectResults, class: classId } = createResultDto;
  
    const classData = await this.classModel.findById(classId);
  if (!classData) {
    throw new NotFoundException('Class not found');
  }

  if (!classData.students.includes(new Types.ObjectId(student))) {
    throw new BadRequestException('Student is not enrolled in this class');
  }
    // Fetch student details including enrolled courses
    const studentData = await this.studentModel.findById(student).populate('courseIds');
  
    if (!studentData) {
      throw new NotFoundException('Student not found');
    }
  

  const enrolledCourses = studentData.courseIds.map((course) => course._id.toString());

  console.log('Enrolled Courses:', enrolledCourses);
  console.log('Submitted Courses:', subjectResults.map((sub) => sub.courseId));

  const missingCourses = subjectResults.filter((sub) => !enrolledCourses.includes(sub.courseId));
  
    if (missingCourses.length > 0) {
      throw new BadRequestException('Student is not enrolled in all selected courses');
    }
  
    // Calculate total score and percentage
    const totalScore = subjectResults.reduce((sum, sub) => sum + sub.score, 0);
    const maxTotalScore = subjectResults.reduce((sum, sub) => sum + sub.maxScore, 0);
    const percentage = (totalScore / maxTotalScore) * 100;
  
    // Save the result
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
    
    return await this.resultModel.find(query).populate('student class').exec();
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
