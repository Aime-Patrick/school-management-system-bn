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
import { TimetableDto } from './dto/timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
@Injectable()
export class ClassService {
  constructor(
    @InjectModel(ClassCombination.name)
    private combinationModel: Model<ClassCombination>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(Result.name) private resultModel: Model<Result>,
    @InjectModel(Class.name) private classModel: Model<Class>,
    private resultService: ResultService,
  ) {}

  async create(
    createClassDto: CreateCombinationDto,
    userId: string,
  ): Promise<ClassCombination> {
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

  async createClass(
    createClassDto: CreateClassDto,
    schoolId: string,
  ): Promise<Class> {
    // Check for duplicate class name in the same school
    const existing = await this.classModel.findOne({
      name: createClassDto.name,
      school: schoolId,
    });
    if (existing) {
      throw new BadRequestException(
        'A class with this name already exists in this school.',
      );
    }

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

  async getAllClassesInSchool(schoolId: string): Promise<Class[]> {
    if (!Types.ObjectId.isValid(schoolId)) {
      throw new BadRequestException('Invalid school ID');
    }
    return this.classModel
      .find({ school: schoolId })
      .populate({
        path: 'combinations',
        populate: {
          path: 'timetable.schedule.teacher',
          select: 'firstName lastName email',
        },
        model: 'ClassCombination',
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
    });

    const savedCombination = await newCombination.save();

    // Add the combination to the parent class
    parentClass.combinations = parentClass.combinations || [];
    parentClass.combinations.push(
      new Types.ObjectId(savedCombination._id as string),
    );
    await parentClass.save();

    return savedCombination;
  }

  async assignTeachersToCombination(
    combinationId: string,
    teacherIds: string[],
  ): Promise<ClassCombination> {
    const combination = await this.combinationModel.findById(combinationId);
    if (!combination) throw new NotFoundException('Combination not found');
    combination.assignedTeachers = teacherIds.map(
      (id) => new Types.ObjectId(id),
    );
    return combination.save();
  }

  async assignStudentsToCombination(
    combinationId: string,
    studentIds: string[],
  ): Promise<ClassCombination> {
    const combination = await this.combinationModel.findById(combinationId);
    if (!combination) throw new NotFoundException('Combination not found');
    combination.students = studentIds.map((id) => new Types.ObjectId(id));
    return combination.save();
  }

  async assignTimetableToCombination(
    combinationId: string,
    timetable: TimetableDto[],
  ): Promise<ClassCombination> {
    const combination = await this.combinationModel.findById(combinationId);
    if (!combination) throw new NotFoundException('Combination not found');

    // Convert teacher string IDs to ObjectId
    const convertedTimetable = timetable.map((day) => ({
      day: day.day,
      schedule: day.schedule.map((sch) => ({
        subject: sch.subject,
        teacher: new Types.ObjectId(sch.teacher), // convert here
        startTime: sch.startTime,
        endTime: sch.endTime,
      })),
    }));

    combination.timetable = convertedTimetable;
    return combination.save();
  }

  async updateTimetableForCombination(
    combinationId: string,
    timetable: UpdateTimetableDto[],
  ): Promise<ClassCombination> {
    const combination = await this.combinationModel.findById(combinationId);
    if (!combination) {
      throw new NotFoundException('Combination not found');
    }
    // Convert teacher string IDs to ObjectId
    const convertedTimetable = timetable.map((day) => ({
      day: day.day ?? '',
      schedule: (day.schedule ?? []).map((sch) => ({
        subject: sch.subject,
        teacher: new Types.ObjectId(sch.teacher), // convert here
        startTime: sch.startTime,
        endTime: sch.endTime,
      })),
    }));
    combination.timetable = convertedTimetable;
    return combination.save();
  }

  async deleteDayFromTimetable(
    combinationId: string,
    day: string,
  ): Promise<ClassCombination> {
    const combination = await this.combinationModel.findById(combinationId);
    if (!combination) {
      throw new NotFoundException('Combination not found');
    }
    // Filter out the day to be deleted
    combination.timetable = combination.timetable.filter(
      (t) => t.day !== day,
    );
    return combination.save();
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
  async deleteClass(classId: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(classId)) {
      throw new BadRequestException('Invalid class ID');
    }
    const deleted = await this.classModel.findByIdAndDelete(classId);
    if (!deleted) {
      throw new NotFoundException('Class not found');
    }
    return { message: 'Class deleted successfully' };
  }
}
