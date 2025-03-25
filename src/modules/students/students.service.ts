import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from 'src/schemas/student.schema';
import { HashService } from 'src/utils/utils.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { School } from 'src/schemas/school.schema';
import { User } from 'src/schemas/user.schema';
import { UserRole } from 'src/schemas/user.schema';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(User.name) private userModel: Model<User>,
    private hashUtils: HashService,
  ) {}

  async createStudent(
    createStudentDto: CreateStudentDto,
    adminId: string,
  ): Promise<Student> {
    try {
      const schoolAdmin = await this.schoolModel
        .findOne({ schoolAdmin: adminId })
        .populate('User');
      if (!schoolAdmin) {
        throw new UnauthorizedException('School Admin not found');
      }

      const schoolId = schoolAdmin._id;
      const currentYear = new Date().getFullYear();
      const studentCount = await this.studentModel.countDocuments({
        school: schoolId,
      });
      const registrationNumber = this.hashUtils.generatorRegistrationNumber(
        schoolAdmin.schoolCode,
        currentYear,
        studentCount,
      );

      const newStudent = new this.studentModel({
        ...createStudentDto,
        school: schoolId,
        registrationNumber,
      });

      await newStudent.save();

      // Now create user credentials for this student
      await this.createStudentCredentials(newStudent);
      return newStudent;
    } catch (error) {
        throw new BadRequestException();
    }
  }

  async createStudentCredentials(student: Student){

    const password = this.hashUtils.generatePassword(student.firstName);
    const hashedPassword = await this.hashUtils.hashPassword(password);

    const user = new this.userModel({
      username: this.hashUtils.generateUsernameForStudent(student.firstName, student.registrationNumber),
      password: hashedPassword,
      role: UserRole.STUDENT
    });
    await user.save();
  }
}
