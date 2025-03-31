import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class } from '../../schemas/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { School } from 'src/schemas/school.schema';
import { Result } from 'src/schemas/result.schema';
import { ResultService } from '../result/result.service';
@Injectable()
export class ClassService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<Class>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(Result.name) private resultModel: Model<Result>,
    private resultService: ResultService,
  ) {}

  async create(createClassDto: CreateClassDto, userId: string): Promise<Class> {
    const school = await this.schoolModel.findOne({schoolAdmin : userId})
    if (!school) {
      throw new NotFoundException('School not found');
    }
    const createdClass = new this.classModel({...createClassDto, school:school});
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
    userId : string
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
  
    if (classDetails.grade) {
      classDetails.grade = classDetails.grade;
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


  private generateGrade(percentage: number): string {
    if (percentage >= 90) return 'Grade A';
    if (percentage >= 75) return 'Grade B';
    if (percentage >= 50) return 'Grade C';
    if (percentage >= 35) return 'Grade D';
    return 'Grade F';
  }


  async calculateClassPerformance(classId: string): Promise<({})> {
    const classExist = await this.classModel.findById(classId);
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
      })
    );
  
    const totalGrades = studentPerformances.reduce((sum, score) => sum + score, 0);
  
    const classAverage = totalGrades / students.length;
  
    const classGrade = this.generateGrade(classAverage)
    classExist.grade = classGrade;
    await classExist.save();
    return {classExist, classAverage};
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
