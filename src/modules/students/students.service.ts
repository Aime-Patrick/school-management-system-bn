import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student } from 'src/schemas/student.schema';
import { HashService } from 'src/utils/utils.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { School } from 'src/schemas/school.schema';
import { User } from 'src/schemas/user.schema';
import { UserRole } from 'src/schemas/user.schema';
import { StudentEnrollIntoCourseDto } from './dto/student-enroll-course.dto';
import { Course } from 'src/schemas/course.schema';
import { Teacher } from 'src/schemas/teacher.schema';
@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    private hashUtils: HashService,
  ) {}

  async createStudent(
    createStudentDto: CreateStudentDto,
    adminId: string,
  ): Promise<{
    newStudent: Student;
    accountCredentails: User;
    studentPassword: string;
  }> {
    try {
      const schoolAdmin = await this.schoolModel.findOne({
        schoolAdmin: adminId,
      });
      if (!schoolAdmin) {
        throw new UnauthorizedException('School Admin not found');
      }
  
      // Check if the phone number already exists in the students or users collection
      const existingStudent = await this.studentModel.findOne({
        phoneNumber: createStudentDto.phoneNumber,
      });
      const existingUser = await this.userModel.findOne({
        phoneNumber: createStudentDto.phoneNumber,
      });
  
      if (existingStudent || existingUser) {
        throw new BadRequestException('Phone number already exists');
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
  
      const { user, password } =
        await this.createStudentCredentials(newStudent);
      return {
        newStudent,
        accountCredentails: user,
        studentPassword: password,
      };
    } catch (error) {
      if (error.code === 11000) {
        // Handle MongoDB duplicate key error
        throw new BadRequestException('Duplicate key error: ' + error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async createStudentCredentials(student: Student) {
    const password = this.hashUtils.generatePassword(student.firstName);
    const hashedPassword = await this.hashUtils.hashPassword(password);

    const user = new this.userModel({
      username: this.hashUtils.generateUsernameForStudent(
        student.firstName,
        student.registrationNumber,
      ),
      password: hashedPassword,
      phoneNumber: student.phoneNumber,
      email: "none",
      role: UserRole.STUDENT,
    });
    await user.save();
    await this.studentModel.findOneAndUpdate(
      { registrationNumber: student?.registrationNumber },
      { accountCredentails: user },
    );
    return { user, password };
  }

  async findAllStudents(userId: string): Promise<Student[]> {
    let school:any;
    let studentsService:any;
    const adminSchool = await this.schoolModel.findOne({ scoolAdmin:userId });
    const teacher = await this.teacherModel.findOne({ "accountCredentails._id": new Types.ObjectId(userId) });
    if (adminSchool){
      school = adminSchool;
      studentsService = await this.studentModel.find({school}).populate('school')
      .select('-accountCredentails')
      .exec();
    } else if(teacher){
      school = teacher?.school;
      studentsService = await this.studentModel.find({ school }).populate('school')
      .select('-accountCredentails')
      .exec();
    }else{
      throw new BadRequestException('School not found');

    }
    return studentsService;
  }

  async findStudentByRegistrationNumber(
    regNumber: string,
    userId: string,
  ): Promise<Student | null> {
    let school:any;
    let studentsService:any;
    const adminSchool = await this.schoolModel.findOne({ scoolAdmin:userId });
    const teacher = await this.teacherModel.findOne({ "accountCredentails._id": new Types.ObjectId(userId) });
    if (adminSchool){
      school = adminSchool;
      studentsService = await this.studentModel.find({registrationNumber:regNumber,school}).populate('school')
      .select('-accountCredentails')
      .exec();
    } else if(teacher){
      school = teacher?.school;
      studentsService = await this.studentModel.find({registrationNumber:regNumber, school }).populate('school')
      .select('-accountCredentails')
      .exec();
    }else{
      throw new BadRequestException('School not found');

    }
    return studentsService;
  }

  async updateStudent(
    regNumber: string,
    createStudentDto: CreateStudentDto,
    userId: string,
  ): Promise<Student | null> {
    let school:any;
    let updatedStudent:any;
    const adminSchool = await this.schoolModel.findOne({ scoolAdmin:userId });
    const teacher = await this.teacherModel.findOne({ "accountCredentails._id": new Types.ObjectId(userId) });
    if (adminSchool){
      school = adminSchool;
      updatedStudent = await this.studentModel
      .findOneAndUpdate({ registrationNumber:regNumber, school }, createStudentDto, {
        new: true,
      })
      .populate('school')
      .select('-accountCredentails')
      .exec();
    } else if(teacher){
      school = teacher?.school;
      updatedStudent = await this.studentModel
      .findOneAndUpdate({ registrationNumber:regNumber, school }, createStudentDto, {
        new: true,
      })
      .populate('school')
      .select('-accountCredentails')
      .exec();
    }else{
      throw new BadRequestException('School not found');

    }
    return updatedStudent;
  }

  async deleteStudent(
    registrationNumber: string,
    schoolAdmin: string,
  ): Promise<boolean> {
    const school = await this.schoolModel.findOne({ schoolAdmin });
    if (!school) {
      throw new BadRequestException('School not found');
    }
    const deletedStudent = await this.studentModel
      .findOneAndDelete({ registrationNumber, school: school._id })
      .exec();
    return !!deletedStudent;
  }

  async getStudentByRegNmber(
    regNumber: string,
    schoolAdmin: string,
  ): Promise<Student | null> {
    const school = await this.schoolModel.findOne({ schoolAdmin });
    if (!school) {
      throw new BadRequestException('School not found');
    }
    return await this.studentModel
      .findOne({ registrationNumber: regNumber, school: school._id })
      .populate('school')
      .select('-accountCredentails')
      .exec();
  }

  async studentEnrollIntoCourse(
    studentEnrollIntoCourse: StudentEnrollIntoCourseDto,
    studentId: string,
  ): Promise<Student> {
    const student = await this.studentModel.findOne({ "accountCredentails._id": new Types.ObjectId(studentId) });
    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const course = await this.courseModel.findById(
      studentEnrollIntoCourse.courseId,
    );
    if (!course) {
      throw new BadRequestException('Course not found');
    }

    if (!student.school.equals(course.school)) {
      throw new BadRequestException(
        'Student can only enroll in courses from their school',
      );
    }
    if (student.courseIds.includes(new Types.ObjectId(studentEnrollIntoCourse.courseId))) {
      throw new BadRequestException(
        'Student is already enrolled in this course',
      );
    }

    student.courseIds.push(new Types.ObjectId(studentEnrollIntoCourse.courseId));
    await student.save();
    course.studentIds.push(student._id)
    await course.save();
    return student;
  }

  async removeStudentFromEnroll(studentId: string, courseId: string):Promise<void> {
    const student = await this.studentModel.findById(studentId);
    if (!student) {
      throw new BadRequestException('Student not found');
    }
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new BadRequestException('Course not found');
    }
    if (!student.courseIds.includes(new Types.ObjectId(courseId))) {
      throw new BadRequestException(
        'Student is not enrolled in this course',
      );
    }
    student.courseIds = student.courseIds.filter((id) => id.toString()!== courseId);
    await student.save();
    course.studentIds = course.studentIds.filter((id) => id.toString()!== studentId);
    await course.save();
    return;
  }
}
