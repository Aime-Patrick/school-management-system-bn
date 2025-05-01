import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Student } from 'src/schemas/student.schema';
import { HashService } from 'src/utils/utils.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { School } from 'src/schemas/school.schema';
import { User } from 'src/schemas/user.schema';
import { UserRole } from 'src/schemas/user.schema';
import { StudentEnrollIntoCourseDto } from './dto/student-enroll-course.dto';
import { Course } from 'src/schemas/course.schema';
import { Teacher } from 'src/schemas/teacher.schema';
import { Class } from 'src/schemas/class.schema';
import { StudentCredentials } from 'src/schemas/student-credentials.schema';
@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(Class.name) private classModel: Model<Class>,
    @InjectModel(StudentCredentials.name)
    private studentCredentialsModel: Model<StudentCredentials>,
    private hashUtils: HashService,
  ) {}

  async createStudent(
    createStudentDto: CreateStudentDto,
    adminId: string,
    file: Express.Multer.File,
  ): Promise<{
    newStudent: Student;
    accountCredentials: StudentCredentials;
    studentPassword: string;
  }> {
    try {
      const schoolAdmin = await this.schoolModel.findOne({
        schoolAdmin: adminId,
      });
      if (!schoolAdmin) {
        throw new UnauthorizedException('School Admin not found');
      }

      const existingStudent = await this.studentModel.findOne({
        phoneNumber: createStudentDto.phoneNumber,
      });
      const existingUser = await this.userModel.findOne({
        phoneNumber: createStudentDto.phoneNumber,
      });

      const existingClass = await this.classModel.findById(
        createStudentDto.class,
      );
      if (!existingClass) {
        throw new BadRequestException('Class not found');
      }
      if (!existingClass.school.equals(schoolAdmin._id)) {
        throw new BadRequestException(
          'Class does not belong to the same school as the student',
        );
      }

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

      if (!file) {
        throw new BadRequestException(
          'No file received. Make sure you are uploading at least one file.',
        );
      }
      const uploadedFile = await this.hashUtils.uploadFileToCloudinary(file);
      createStudentDto.profilePicture = uploadedFile.url;

      const newStudent = new this.studentModel({
        ...createStudentDto,
        school: schoolId,
        registrationNumber,
      });

      await newStudent.save();

      // Generate credentials
      const { password } =
        await this.createStudentCredentials(newStudent, createStudentDto.email);
      const hashedPassword = await this.hashUtils.hashPassword(password);

      const credentials = new this.studentCredentialsModel({
        username: this.hashUtils.generateUsernameForStudent(
          newStudent.firstName,
          registrationNumber,
        ),
        password: hashedPassword,
        registrationNumber,
        class: createStudentDto.class,
        student: newStudent._id,
      });

      existingClass.students.push(newStudent._id);
      await existingClass.save();

      await credentials.save();

      return {
        newStudent,
        accountCredentials: credentials,
        studentPassword: password,
      };
    } catch (error) {
      if (error.code === 11000) {
        // Handle MongoDB duplicate key error
        throw new BadRequestException('Duplicate key error: ' + error.message);
      }
      throw error;
    }
  }

  async createStudentCredentials(student: Student, email?: string) {
    const password = this.hashUtils.generatePassword(student.firstName);
    const hashedPassword = await this.hashUtils.hashPassword(password);

    const user = new this.userModel({
      username: this.hashUtils.generateUsernameForStudent(
        student.firstName,
        student.registrationNumber,
      ),
      password: hashedPassword,
      phoneNumber: student.phoneNumber,
      email: email ? email : 'none',
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
    let school: any;
    let studentsService: any;

    const adminSchool = await this.schoolModel.findOne({ schoolAdmin: userId });
    const teacher = await this.teacherModel.findOne({
      'accountCredentails._id': new Types.ObjectId(userId),
    });

    if (adminSchool) {
      school = adminSchool;
      studentsService = await this.studentModel
        .find({ school: school._id })
        .populate('school')
        .populate('class')
        .populate('accountCredentails', 'email')
        .exec();
    } else if (teacher) {
      school = teacher?.school;
      studentsService = await this.studentModel
        .find({ school })
        .populate('school')
        .populate('class')
        .populate('accountCredentails', 'email')
        .exec();
    } else {
      throw new BadRequestException('School not found');
    }

    return studentsService;
  }

  async findStudentByRegistrationNumber(
    regNumber: string,
    userId: string,
  ): Promise<Student | null> {
    let school: any;
    let studentsService: any;
    const adminSchool = await this.schoolModel.findOne({ scoolAdmin: userId });
    const teacher = await this.teacherModel.findOne({
      'accountCredentails._id': new Types.ObjectId(userId),
    });
    if (adminSchool) {
      school = adminSchool;
      studentsService = await this.studentModel
        .find({ registrationNumber: regNumber, school })
        .populate('school')
        .populate('accountCredentails', 'email')
        .populate('class')
        .exec();
    } else if (teacher) {
      school = teacher?.school;
      studentsService = await this.studentModel
        .find({ registrationNumber: regNumber, school })
        .populate('school')
        .populate('class')
        .populate('accountCredentails', 'email')
        .exec();
    } else {
      throw new BadRequestException('School not found');
    }
    return studentsService;
  }

  async updateStudent(
    regNumber: string,
    createStudentDto: CreateStudentDto,
    userId: string,
  ): Promise<Student | null> {
    let school: any;
    let updatedStudent: any;
    const adminSchool = await this.schoolModel.findOne({ scoolAdmin: userId });
    const teacher = await this.teacherModel.findOne({
      'accountCredentails._id': new Types.ObjectId(userId),
    });
    if (adminSchool) {
      school = adminSchool;
      updatedStudent = await this.studentModel
        .findOneAndUpdate(
          { registrationNumber: regNumber, school },
          createStudentDto,
          {
            new: true,
          },
        )
        .populate('school')
        .select('-accountCredentails')
        .exec();
    } else if (teacher) {
      school = teacher?.school;
      updatedStudent = await this.studentModel
        .findOneAndUpdate(
          { registrationNumber: regNumber, school },
          createStudentDto,
          {
            new: true,
          },
        )
        .populate('school')
        .select('-accountCredentails')
        .exec();
    } else {
      throw new BadRequestException('School not found');
    }
    return updatedStudent;
  }

  async deleteStudent(
    studentId: string,
    schoolAdmin: string,
  ): Promise<boolean> {
   try {
    const school = await this.schoolModel.findOne({ schoolAdmin });
    if (!school) {
      throw new BadRequestException('School not found');
    }
    const deletedStudent = await this.studentModel
      .findOneAndDelete({ _id: new mongoose.Types.ObjectId(studentId), school: school._id })
      .exec();
    if (!deletedStudent) {
      throw new NotFoundException('Student not found');
    }
    await this.studentCredentialsModel
      .findOneAndDelete({ student: deletedStudent._id })
      .exec();
  
    return true;
   } catch (error) {
    throw error;
   }
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
    const student = await this.studentModel.findOne({
      'accountCredentails._id': new Types.ObjectId(studentId),
    });
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
    if (
      student.courseIds.includes(
        new Types.ObjectId(studentEnrollIntoCourse.courseId),
      )
    ) {
      throw new BadRequestException(
        'Student is already enrolled in this course',
      );
    }

    student.courseIds.push(
      new Types.ObjectId(studentEnrollIntoCourse.courseId),
    );
    await student.save();
    course.studentIds.push(student._id);
    await course.save();
    return student;
  }

  async removeStudentFromEnroll(
    studentId: string,
    courseId: string,
  ): Promise<void> {
    const student = await this.studentModel.findById(studentId);
    if (!student) {
      throw new BadRequestException('Student not found');
    }
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new BadRequestException('Course not found');
    }
    if (!student.courseIds.includes(new Types.ObjectId(courseId))) {
      throw new BadRequestException('Student is not enrolled in this course');
    }
    student.courseIds = student.courseIds.filter(
      (id) => id.toString() !== courseId,
    );
    await student.save();
    course.studentIds = course.studentIds.filter(
      (id) => id.toString() !== studentId,
    );
    await course.save();
    return;
  }

  async getAllStudent() {
    const students = await this.studentModel
      .find()
      .populate('school')
      .select('-accountCredentails')
      .exec();
    return students;
  }

  async findStudentById(userId: string): Promise<Teacher | null> {
    return await this.studentModel.findOne({
      'accountCredentails._id': new Types.ObjectId(userId),
    });
  }

  async resetStudentPassword(
    registrationNumber: string,
  ): Promise<{ message: string; newPassword: string }> {
    const credentials = await this.studentCredentialsModel.findOne({
      registrationNumber,
    });
    if (!credentials) {
      throw new NotFoundException('Student credentials not found');
    }

    const newPassword = this.hashUtils.generatePassword(credentials.username);
    const hashedPassword = await this.hashUtils.hashPassword(newPassword);

    credentials.password = hashedPassword;
    await credentials.save();

    return { message: 'Password reset successfully', newPassword };
  }

  async getStudentsCredentials(school: string): Promise<StudentCredentials[]> {
    const credentials = await this.studentCredentialsModel
      .find()
      .populate({
        path: 'student',
        match: { school: new Types.ObjectId(school) }, 
        select: 'firstName lastName registrationNumber',
      })
      .exec();

    return credentials.filter((credential) => credential.student !== null);
  }
}
