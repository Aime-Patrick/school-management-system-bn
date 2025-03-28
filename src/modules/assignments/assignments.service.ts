import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assignment } from 'src/schemas/assignment.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Teacher } from 'src/schemas/teacher.schema';
import { Student } from 'src/schemas/student.schema';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(Student.name) private studentModel: Model<Student>,

  ) {}

  async createAssignment(
    createAssignmentDto: CreateAssignmentDto,
    teacher: string,
  ): Promise<Assignment> {
    const teacherId = await this.teacherModel.findOne({
      'accountCredentails._id': new Types.ObjectId(teacher),
    });
    if (!teacherId) throw new NotFoundException('Teacher not found');
    const assignment = new this.assignmentModel({
      ...createAssignmentDto,
      teacher: teacherId,
    });
    return await assignment.save();
  }

  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    return await this.assignmentModel
      .find({ course: courseId })
      .populate(['teacher', 'term'])
      .exec();
  }

  async submitAssignment(
    assignmentId: string,
    studentId: string,
    score: number,
  ): Promise<Assignment> {
    const assignment = await this.assignmentModel.findById(assignmentId);
    if (!assignment) throw new NotFoundException('Assignment not found');

    const studentExist = await this.studentModel.findById(studentId);
    if (!studentExist) throw new NotFoundException('Student not found');
    assignment.submissions.push({
      student: new Types.ObjectId(studentId),
      score,
    });
    return await assignment.save();
  }
}
