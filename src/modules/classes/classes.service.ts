import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClassCombination } from '../../schemas/ClassCombination.schema';
import { CreateCombinationDto } from './dto/create-class-combination.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { School } from 'src/schemas/school.schema';
import { Result } from 'src/schemas/result.schema';
import { ResultService } from '../result/result.service';
import { Class } from 'src/schemas/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
@Injectable()
export class ClassService {
  constructor(
    @InjectModel(ClassCombination.name) private combinationModel: Model<ClassCombination>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(Result.name) private resultModel: Model<Result>,
    @InjectModel(Class.name) private classModel: Model<Class>,
    private resultService: ResultService,
  ) {}

  async create(createClassDto: CreateCombinationDto, userId: string): Promise<ClassCombination> {
    const school = await this.schoolModel.findOne({ schoolAdmin: userId });
    if (!school) {
      throw new NotFoundException('School not found');
    }
    const createdClass = new this.combinationModel({
      ...createClassDto,
      school: school,
    });
    return createdClass.save();
  }

  async createClass(createClassDto: CreateClassDto, schoolId: string): Promise<Class> {
    const createdClass = new this.classModel({
      name: createClassDto.name,
      combinations: [],
      school: schoolId,
    });
    return createdClass.save();
  }

  async getAllClasses(
    grade?: string,
    subject?: string,
    teacherId?: string,
  ): Promise<ClassCombination[]> {
    const filters: any = {};
    if (grade) filters.grade = grade;
    if (subject) filters['timetable.schedule.subject'] = subject;
    if (teacherId) filters['assignedTeachers'] = new Types.ObjectId(teacherId);

    return this.combinationModel
      .find(filters)
      .populate('assignedTeachers')
      .populate('students')
      .populate({
        path: 'timetable.schedule.teacher',
        select: 'firstName lastName email',
      })
      .exec();
  }

  // Get class details
  async getClassById(classId: string): Promise<ClassCombination> {
    if (!Types.ObjectId.isValid(classId)) {
      throw new BadRequestException('Invalid class ID');
    }
    const classDetails = await this.combinationModel
      .findById(classId)
      .populate('assignedTeachers')
      .populate('students')
      .populate({
        path: 'timetable.schedule.teacher',
        select: 'firstName lastName email',
      })
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
    userId: string,
  ): Promise<ClassCombination> {
    const classDetails = await this.getClassById(classId);
    const existingIds = new Set(classDetails.students.map(id => id.toString()));
    const newIds = studentIds
      .map(id => new Types.ObjectId(id))
      .filter(id => !existingIds.has(id.toString()));

    classDetails.students.push(...newIds);
    await classDetails.save();
    return classDetails;
  }

  // Remove students from class
  async removeStudentsFromClass(
    classId: string,
    studentIds: string[],
  ): Promise<ClassCombination> {
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
  ): Promise<ClassCombination> {
    const classDetails = await this.getClassById(classId);

    if (!classDetails) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Update class name if provided
    if (updateClassDto.name) {
      classDetails.name = updateClassDto.name;
    }

    // Remove full days from the timetable
    if (updateClassDto.removeDays?.length) {
      classDetails.timetable = classDetails.timetable.filter(
        (t) => !(updateClassDto.removeDays ?? []).includes(t.day),
      );
    }

    // Remove specific schedule entries
    if (updateClassDto.removeSchedules?.length) {
      updateClassDto.removeSchedules.forEach((removeItem) => {
        const dayToEdit = classDetails.timetable.find(
          (t) => t.day === removeItem.day,
        );
        if (dayToEdit) {
          dayToEdit.schedule = dayToEdit.schedule.filter(
            (s) =>
              !(
                s.subject === removeItem.subject &&
                s.teacher.toString() === removeItem.teacherId &&
                s.startTime === removeItem.startTime &&
                s.endTime === removeItem.endTime
              ),
          );
        }
      });
    }

    // Add or update schedules
    if (updateClassDto.timetable?.length) {
      updateClassDto.timetable.forEach((newTimetable) => {
        // Check if day exists
        let existingDay = classDetails.timetable.find(
          (t) => t.day === newTimetable.day,
        );

        // If day exists, clear all existing schedules (as per your new request)
        if (existingDay) {
          // Merge schedules, prevent duplicates
          const existingSchedules = existingDay.schedule.map(s => ({
            subject: s.subject,
            teacher: s.teacher.toString(),
            startTime: s.startTime,
            endTime: s.endTime,
          }));

          newTimetable.schedule.forEach((newSchedule) => {
            const teacherId = typeof newSchedule.teacher === 'object'
              ? (typeof newSchedule.teacher === 'object' && newSchedule.teacher !== null && '_id' in newSchedule.teacher
                  ? (newSchedule.teacher as { _id: string })._id
                  : newSchedule.teacher)
              : newSchedule.teacher;

            if (!Types.ObjectId.isValid(teacherId)) {
              throw new BadRequestException(`Invalid teacher ID: ${teacherId}`);
            }

            const isDuplicate = existingSchedules.some(s =>
              s.subject === newSchedule.subject &&
              s.teacher === teacherId &&
              s.startTime === newSchedule.startTime &&
              s.endTime === newSchedule.endTime
            );

            if (!isDuplicate) {
              existingDay.schedule.push({
                subject: newSchedule.subject,
                teacher: new Types.ObjectId(teacherId),
                startTime: newSchedule.startTime,
                endTime: newSchedule.endTime,
              });
            }
          });
        } else {
          // New day, add it
          classDetails.timetable.push({
            day: newTimetable.day,
            schedule: newTimetable.schedule.map((newSchedule) => {
              const teacherId =
                typeof newSchedule.teacher === 'object' && newSchedule.teacher !== null && '_id' in newSchedule.teacher
                  ? (newSchedule.teacher as { _id: string })._id
                  : newSchedule.teacher;

              if (!Types.ObjectId.isValid(teacherId)) {
                throw new BadRequestException(
                  `Invalid teacher ID: ${teacherId}`,
                );
              }

              return {
                subject: newSchedule.subject,
                teacher: new Types.ObjectId(teacherId),
                startTime: newSchedule.startTime,
                endTime: newSchedule.endTime,
              };
            }),
          });
        }
      });
    }

    // Update assigned teachers
    if (updateClassDto.assignedTeachers) {
      classDetails.assignedTeachers = updateClassDto.assignedTeachers.map(
        (teacher) => {
          if (!Types.ObjectId.isValid(teacher.teacherId)) {
            throw new BadRequestException(
              `Invalid teacher ID: ${teacher.teacherId}`,
            );
          }
          return new Types.ObjectId(teacher.teacherId);
        },
      );
    }

    return await classDetails.save();
  }

  private generateGrade(percentage: number): string {
    if (percentage >= 90) return 'Grade A';
    if (percentage >= 75) return 'Grade B';
    if (percentage >= 50) return 'Grade C';
    if (percentage >= 35) return 'Grade D';
    return 'Grade F';
  }

  async calculateClassPerformance(classId: string): Promise<{}> {
    const classExist = await this.combinationModel.findById(classId);
    if (!classExist) {
      throw new NotFoundException('Class not found');
    }

    const students = classExist.students;

    if (students.length === 0) {
      throw new NotFoundException('No students found in this class');
    }

    const studentPerformances = await Promise.all(
      students.map(async (studentId) => {
        const results = await this.resultModel.findOne({ student: studentId });

        return results ? results.totalScore : 0;
      }),
    );

    const totalGrades = studentPerformances.reduce(
      (sum, score) => sum + score,
      0,
    );

    const classAverage = totalGrades / students.length;

    const classGrade = this.generateGrade(classAverage);
    classExist.grade = classGrade;
    await classExist.save();
    return { classExist, classAverage };
  }

  async addCombinationToClass(
    classId: string,
    createCombinationDto: CreateCombinationDto,
  ): Promise<ClassCombination> {
    const parentClass = await this.classModel.findById(classId);
    if (!parentClass) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const newCombination = new this.combinationModel({
      name: createCombinationDto.name,
      parentClass: classId,
      assignedTeachers: createCombinationDto.assignedTeachers || [],
      students: createCombinationDto.students || [],
      timetable: createCombinationDto.timetable || [],
    });

    const savedCombination = await newCombination.save();

    // Add the combination to the parent class
    parentClass.combinations = parentClass.combinations || [];
    parentClass.combinations.push(new Types.ObjectId(savedCombination._id as string));
    await parentClass.save();

    return savedCombination;
  }

  //   async getClassGradesBySchool(userId: string): Promise<any> {
  //     const school = await this.schoolModel.findOne({schoolAdmin: userId})
  //     const classes = await this.classModel
  //       .find({school: school.id})
  //       .populate('school') // Get school details
  //       .populate({
  //         path: 'students',
  //         populate: {
  //           path: 'results',
  //           model: 'Result', // Assuming result model is referenced here
  //         },
  //       });

  //     // 2️⃣ Process each class
  //     const classGrades = classes.map((classData) => {
  //       const { _id, name, school, students } = classData;

  //       // 3️⃣ Compute class average from student results
  //       let totalScore = 0;
  //       let totalStudents = 0;

  //       students.forEach((student) => {
  //         if (student.results.length > 0) {
  //           const studentTotal = student.results.reduce((sum, res) => sum + res.percentage, 0);
  //           totalScore += studentTotal / student.results.length;
  //           totalStudents++;
  //         }
  //       });

  //       const averageScore = totalStudents > 0 ? totalScore / totalStudents : 0;

  //       // 4️⃣ Assign Grade Based on Average Score
  //       let grade = 'F';
  //       if (averageScore >= 90) grade = 'A';
  //       else if (averageScore >= 80) grade = 'B';
  //       else if (averageScore >= 70) grade = 'C';
  //       else if (averageScore >= 60) grade = 'D';

  //       return {
  //         classId: _id,
  //         className: name,
  //         schoolName: school.name,
  //         averageScore,
  //         grade,
  //       };
  //     });

  //     // 5️⃣ Group and sort by grades
  //     const groupedGrades = {
  //       A: [],
  //       B: [],
  //       C: [],
  //       D: [],
  //       F: [],
  //     };

  //     classGrades.forEach((classGrade) => {
  //       groupedGrades[classGrade.grade].push(classGrade);
  //     });

  //     return groupedGrades;
  //   }
}
