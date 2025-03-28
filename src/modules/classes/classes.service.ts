import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class } from '../../schemas/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<Class>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const createdClass = new this.classModel(createClassDto);
    return createdClass.save();
  }

  async getAllClasses(
    grade?: string,
    subject?: string,
    teacherId?: string,
  ): Promise<Class[]> {
    const filters: any = {};
    if (grade) filters.grade = grade;
    if (subject) filters['timetable.schedule.subject'] = subject;
    if (teacherId) filters['assignedTeachers'] = new Types.ObjectId(teacherId);

    return this.classModel
      .find(filters)
      .populate('assignedTeachers')
      .populate('students');
  }

  // Get class details
  async getClassById(classId: string): Promise<Class> {
    const classDetails = await this.classModel
      .findById(classId)
      .populate('assignedTeachers')
      .populate('students')
      .exec();

    if (!classDetails) {
      throw new NotFoundException('Class not found');
    }

    return classDetails;
  }

  // Add students to class
  async addStudentsToClass(
    classId: string,
    studentIds: string[],
  ): Promise<Class> {
    const classDetails = await this.getClassById(classId);
    
    classDetails.students.push(...studentIds.map(id => new Types.ObjectId(id)));
    await classDetails.save();
    
    return classDetails;
  }

  // Remove students from class
  async removeStudentsFromClass(
    classId: string,
    studentIds: string[],
  ): Promise<Class> {
    const classDetails = await this.getClassById(classId);

    classDetails.students = classDetails.students.filter(
      (student) => !studentIds.includes(student.toString()),
    );
    await classDetails.save();

    return classDetails;
  }

  // Update class details
  async updateClass(
    classId: string,
    updateClassDto: UpdateClassDto,
  ): Promise<Class> {
    // Fetch the class details
    const classDetails = await this.getClassById(classId);
  
    if (!classDetails) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }
  
    // Update class details only if provided in the DTO
    if (updateClassDto.name) {
      classDetails.name = updateClassDto.name;
    }
  
    if (updateClassDto.grade) {
      classDetails.grade = updateClassDto.grade;
    }
  
    if (updateClassDto.timetable) {
      classDetails.timetable = updateClassDto.timetable.map((timetable) => ({
        day: timetable.day,
        schedule: timetable.schedule.map((schedule) => ({
          subject: schedule.subject,
          teacher: new Types.ObjectId(schedule.teacher),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        })),
      }));
    }
  
    if (updateClassDto.assignedTeachers) {
      classDetails.assignedTeachers = updateClassDto.assignedTeachers.map(
        (teacher) => new Types.ObjectId(teacher.teacherId),
      );
    }

    return await classDetails.save();
  }

  // Get class performance (aggregate results)
  async getClassPerformance(classId: string): Promise<any> {
    const classDetails = await this.getClassById(classId);
    
    const performance = classDetails.performance.map((studentPerformance) => {
      const averageGrade =
        studentPerformance.grades.reduce((a, b) => a + b, 0) /
        studentPerformance.grades.length;
      return {
        studentId: studentPerformance.student,
        averageGrade,
      };
    });

    return performance;
  }
}
