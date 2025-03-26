import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Teacher } from '../../schemas/teacher.schema';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { School } from 'src/schemas/school.schema';
import { HashService } from 'src/utils/utils.service';
import { User, UserRole } from 'src/schemas/user.schema';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

interface ITeacher extends Teacher {
  _id: Types.ObjectId;
}
@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(User.name) private userModel: Model<User>,
    private hashUtils: HashService,
  ) {}
  async createTeacher(
    createTeacherDto: CreateTeacherDto,
    schoolAdmin: string,
  ): Promise<{
    newTeacher: Teacher;
    teacherPassword: string;
  }> {
    try {
      const school = await this.schoolModel
        .findOne({ schoolAdmin: schoolAdmin })
        .exec();
      if (!school) {
        throw new BadRequestException('School not found');
      }
      const existingTeacher = await this.teacherModel.findOne({
        firstName: createTeacherDto.firstName,
        lastName: createTeacherDto.lastName,
      });
      if (existingTeacher) {
        throw new BadRequestException('Teacher already exists');
      }
      const existingUser = await this.userModel.findOne({
        email: createTeacherDto.email,
      });
      if (existingUser) {
        throw new BadRequestException('user already exists');
      }
      const createdTeacher = new this.teacherModel({
        ...createTeacherDto,
        school: school._id,
      });
      await createdTeacher.save();
      const { newTeacher, password } = await this.createTeacherCredentials(
        createdTeacher,
        createTeacherDto.email,
        createTeacherDto.phoneNumber,
      );
      return {
        newTeacher,
        teacherPassword: password,
      };
    } catch (error) {
      throw error;
    }
  }

  async createTeacherCredentials(
    teacher: ITeacher,
    email: string,
    phoneNumber: string,
  ) {
    const password = this.hashUtils.generatePassword(teacher.firstName);
    const hashedPassword = await this.hashUtils.hashPassword(password);
    const user = new this.userModel({
      username: this.hashUtils.generateUsernameForTeacher(
        teacher.firstName,
        teacher.lastName,
      ),
      email,
      phoneNumber,
      password: hashedPassword,
      role: UserRole.TEACHER,
    });
    await user.save();
    const newTeacher = await this.teacherModel
      .findByIdAndUpdate(
        { _id: teacher._id },
        { accountCredentails: user },
        { new: true },
      )
      .populate('school');

    if (!newTeacher) {
      throw new BadRequestException('Teacher not found');
    }

    return { newTeacher, password };
  }

  async getTeachersBySchool(schoolId: string): Promise<Teacher[]> {
    try {
      const teachers = await this.teacherModel
        .find({ school: schoolId })
        .populate('school')
        .exec();

      return teachers;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch teachers for the given school',
      );
    }
  }

  async getTeacherById(teacherId: string): Promise<Teacher> {
    try {
      const teacher = await this.teacherModel
       .findById(teacherId)
       .populate('school')
       .exec();

      if (!teacher) {
        throw new BadRequestException('Teacher not found');
      }

      return teacher;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch teacher details');
    }
  }

  async updateTeacher(
    teacherId: string,
    updateTeacherDto: CreateTeacherDto,
  ): Promise<Teacher> {
    try {
      const updatedTeacher = await this.teacherModel.findByIdAndUpdate(
        { _id: teacherId },
        updateTeacherDto,
        { new: true },
      ).populate('school');

      if (!updatedTeacher) {
        throw new BadRequestException('Teacher not found');
      }

      return updatedTeacher;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update teacher details');
    }
  }

  async deleteTeacher(teacherId: string): Promise<boolean> {
    try {
      const deletedTeacher = await this.teacherModel.findByIdAndDelete(teacherId);

      if (!deletedTeacher) {
        throw new BadRequestException('Teacher not found');
      }

      return true;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete teacher');
    }
  }
}
