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
import { MailService } from '../mail/mail.service';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
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
    private mailService: MailService,
  ) {}
  async createTeacher(
    createTeacherDto: CreateTeacherDto,
    schoolAdmin: string,
    file: Express.Multer.File,
  ): Promise<{ newTeacher: Teacher; teacherPassword: string }> {
    try {
      const school = await this.schoolModel.findOne({ schoolAdmin }).exec();
      if (!school) throw new BadRequestException('School not found');
  
      const existingTeacher = await this.teacherModel.findOne({
        firstName: createTeacherDto.firstName,
        lastName: createTeacherDto.lastName,
      });
      if (existingTeacher) throw new BadRequestException('Teacher already exists');
  
      const existingUser = await this.userModel.findOne({
        $or: [
          { email: createTeacherDto.email },
          { phoneNumber: createTeacherDto.phoneNumber }
        ]
      });
      
      if (existingUser) throw new BadRequestException('Phone number or account is already in use');
  
      // generate credentials first
      const password = this.hashUtils.generatePassword(createTeacherDto.firstName);
      const hashedPassword = await this.hashUtils.hashPassword(password);
      const user = new this.userModel({
        username: this.hashUtils.generateUsernameForTeacher(
          createTeacherDto.firstName,
          createTeacherDto.lastName,
        ),
        email: createTeacherDto.email,
        phoneNumber: createTeacherDto.phoneNumber,
        password: hashedPassword,
        role: UserRole.TEACHER,
      });
      await user.save();
      if (file){
        const uploadedFile = await this.hashUtils.uploadFileToCloudinary(file);
        createTeacherDto.profilePicture = uploadedFile.url;
      }
  
      const createdTeacher = new this.teacherModel({
        ...createTeacherDto,
        school: school._id,
        accountCredentails: user._id,
      });
      const newTeacher = await createdTeacher.save();
      await this.mailService.sendAccountInfoEmail(user.email,user.username,password, UserRole.TEACHER)
      return {
        newTeacher: await newTeacher.populate('school'),
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
    try {
      const password = this.hashUtils.generatePassword(teacher.firstName);
    const hashedPassword = await this.hashUtils.hashPassword(password);

    const existingPhone = await this.userModel.findOne({ phoneNumber });
    console.log(existingPhone)
  if (existingPhone) {
    throw new BadRequestException('Phone number is already in use');
  }
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
    } catch (error) {
      throw error;
    }
  }

  async getTeachersBySchool(schoolId: string): Promise<Teacher[]> {
    try {
      const teachers = await this.teacherModel
        .find({ school: schoolId })
        .populate('school')
        .populate('accountCredentails')
        .populate("coursesTaught")
        .exec();

      return teachers;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch teachers for the given school',
      );
    }
  }

async findTeacher(identifier: string): Promise<Teacher | null> {
  // Try to find by teacher _id
  if (Types.ObjectId.isValid(identifier)) {
    const teacher = await this.teacherModel.findById(identifier)
      .populate('school')
      .populate('accountCredentails')
      .populate("coursesTaught")
      .exec();
    if (teacher) return teacher;
  }
  // Try to find by accountCredentails (user _id)
  return await this.teacherModel.findOne({ accountCredentails: identifier })
    .populate('school')
    .populate('accountCredentails')
    .populate("coursesTaught")
    .exec();
}

  async updateTeacher(
    teacherId: string,
    updateTeacherDto: UpdateTeacherDto,
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

  async findTeacherById(userId:string): Promise<Teacher | null>{
    return await this.teacherModel.findOne({ "accountCredentails._id": new Types.ObjectId(userId) });
  }
}
