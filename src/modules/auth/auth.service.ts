import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from 'src/schemas/user.schema';
import { HashService } from 'src/utils/utils.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Teacher } from 'src/schemas/teacher.schema';
import { Student } from 'src/schemas/student.schema';
import { School } from 'src/schemas/school.schema';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    private hashUtils: HashService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ token: string; message: string }> {
    const { identifier, password } = loginDto;
  
    try {
      const user = await this.userModel.findOne({
        $or: [{ email: identifier }, { phoneNumber: identifier }, { username: identifier }],
      }).exec();
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const isPasswordValid = await this.hashUtils.comparePassword(
        password,
        user.password,
      );
  
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }
  
      const payload: any = {
        id: user.id,
        role: user.role,
        email: user.email,
        username: user.username,
      };
  
      // Inject schoolId based on role
      if (user.role === UserRole.TEACHER) {
        const teacher = await this.teacherModel.findOne({ accountCredentails: user._id });
        if (teacher) payload.schoolId = teacher.school.toString();
      } else if (user.role === UserRole.STUDENT) {
        const student = await this.studentModel.findOne({ accountCredentails: user._id });
        if (student) payload.schoolId = student.school.toString();
      } else if (user.role === UserRole.SCHOOL_ADMIN) {
        const admin = await this.schoolModel.findOne({ schoolAdmin: user._id });
        if (admin) payload.schoolId = admin._id;
      }
  
      const token = this.jwtService.sign(payload, {
        expiresIn: loginDto.rememberMe ? '30d' : '1h',
      });
  
      return { message: 'login successful', token };
    } catch (error) {
      throw error;
    }
  }
}
