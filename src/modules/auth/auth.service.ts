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
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    private hashUtils: HashService,
    private jwtService: JwtService,
    private mailService: MailService,
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
        profileImage:user.profileImage,
        joinedAt: user['createdAt'],
      };
  
      // Inject schoolId based on role
      if (user.role === UserRole.TEACHER) {
        const teacher = await this.teacherModel.findOne({ 'accountCredentails': user._id });
        if (teacher) payload.schoolId = teacher.school.toString();
      } else if (user.role === UserRole.STUDENT) {
        const student = await this.studentModel.findOne({ 'accountCredentails._id': user._id });
        if (student) payload.schoolId = student.school.toString();
      } else if (user.role === UserRole.SCHOOL_ADMIN) {
        const admin = await this.schoolModel.findOne({ schoolAdmin: user._id.toString() });
        if (admin) payload.schoolId = admin._id.toString();
      } else if (user.role === UserRole.SYSTEM_ADMIN) {
        // System admin: no schoolId needed
        // Do nothing, no schoolId required
      } else {
        throw new UnauthorizedException('Invalid user role');
      }
  
      const token = this.jwtService.sign(payload, {
        expiresIn: loginDto.rememberMe ? '30d' : '1h',
      });
  
      return { message: 'login successful', token };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Find user by reset token and check expiry
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).exec();

    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    // Allow only TEACHER or SCHOOL_ADMIN
    if (![UserRole.TEACHER, UserRole.SCHOOL_ADMIN].includes(user.role as UserRole)) {
      throw new UnauthorizedException('Only teachers and school admins can reset password');
    }

    // Hash and update password
    const hashedPassword = await this.hashUtils.hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = new Date(0);
    await user.save();

    return { message: 'Password reset successful' };
  }

  async forgotPassword(identifier: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }, { username: identifier }],
    }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (![UserRole.TEACHER, UserRole.SCHOOL_ADMIN].includes(user.role as UserRole)) {
      throw new UnauthorizedException('Only teachers and school admins can use forgot password');
    }

    let fullName = '';
    if (user.role === UserRole.TEACHER) {
      const teacher = await this.teacherModel.findOne({ accountCredentails: user._id });
      fullName = teacher ? `${teacher.firstName} ${teacher.lastName}` : user.username;
    } else if (user.role === UserRole.SCHOOL_ADMIN) {
      const school = await this.schoolModel.findOne({ schoolAdmin: user._id });
      fullName = school ? school.schoolName : user.username;
    }

    const resetToken = randomBytes(16).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    await user.save();

    await this.mailService.sendPasswordResetEmail(
      user.email,
      fullName,
      resetToken,
    );

    return { message: 'Reset token sent to your email.' };
  }
}
