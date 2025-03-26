import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assignment } from 'src/schemas/assignment.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(@InjectModel(Assignment.name) private assignmentModel: Model<Assignment>) {}

  async createAssignment(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = new this.assignmentModel(createAssignmentDto);
    return await assignment.save();
  }

  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    return await this.assignmentModel.find({ course: courseId }).populate(['teacher', 'term']).exec();
  }

  async submitAssignment(assignmentId: string, studentId: string, score: number): Promise<Assignment> {
    const assignment = await this.assignmentModel.findById(assignmentId);
    if (!assignment) throw new NotFoundException('Assignment not found');

    assignment.submissions.push({ student: new Types.ObjectId(studentId), score });
    return await assignment.save();
  }
}

