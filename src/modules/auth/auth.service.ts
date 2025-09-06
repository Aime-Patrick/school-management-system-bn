import {
  BadRequestException,
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
import { Librarian } from 'src/schemas/librarian.schema';
import { Accountant } from 'src/schemas/accountant.schema';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(Librarian.name) private librarianModel: Model<Librarian>,
    @InjectModel(Accountant.name) private accountantModel: Model<Accountant>,
    private hashUtils: HashService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ token: string; message: string }> {
    const { identifier, password } = loginDto;

    try {
      const user = await this.userModel
        .findOne({
          $or: [
            { email: identifier },
            { phoneNumber: identifier },
            { username: identifier },
          ],
        })
        .exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await this.hashUtils.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: any = {
        id: user.id,
        role: user.role,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
        joinedAt: user['createdAt'],
      };

      // Standardized schoolId assignment - all users get school from User.school field
      if (user.role === UserRole.SYSTEM_ADMIN) {
        // System admin: no schoolId needed
        // Do nothing, no schoolId required
      } else {
        // All other roles should have school assignment
        if (user.school) {
          payload.schoolId = user.school.toString();
        } else {
          // Don't throw error here, let the application handle missing school
        }
      }

      const token = this.jwtService.sign(payload, {
        expiresIn: loginDto.rememberMe ? '30d' : '1h',
      });

      return { message: 'login successful', token };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Find user by reset token and check expiry
    const user = await this.userModel
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();

    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    // Allow TEACHER, SCHOOL_ADMIN, LIBRARIAN, and ACCOUNTANT
    if (
      ![
        UserRole.TEACHER,
        UserRole.SCHOOL_ADMIN,
        UserRole.LIBRARIAN,
        UserRole.ACCOUNTANT,
      ].includes(user.role as UserRole)
    ) {
      throw new UnauthorizedException(
        'Only teachers, school admins, librarians, and accountants can reset password',
      );
    }

    // Hash and update password
    const hashedPassword = await this.hashUtils.hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = '';
    user.resetPasswordExpires = new Date(0);
    await user.save();

    return { message: 'Password reset successful' };
  }

  async forgotPassword(identifier: string): Promise<{ message: string }> {
    const user = await this.userModel
      .findOne({
        $or: [
          { email: identifier },
          { phoneNumber: identifier },
          { username: identifier },
        ],
      })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      ![
        UserRole.TEACHER,
        UserRole.SCHOOL_ADMIN,
        UserRole.LIBRARIAN,
        UserRole.ACCOUNTANT,
      ].includes(user.role as UserRole)
    ) {
      throw new UnauthorizedException(
        'Only teachers, school admins, librarians, and accountants can use forgot password',
      );
    }

    let fullName = '';
    if (user.role === UserRole.TEACHER) {
      const teacher = await this.teacherModel.findOne({
        accountCredentails: user._id,
      });
      fullName = teacher
        ? `${teacher.firstName} ${teacher.lastName}`
        : user.username;
    } else if (user.role === UserRole.SCHOOL_ADMIN) {
      const school = await this.schoolModel.findOne({ schoolAdmin: user._id });
      fullName = school ? school.schoolName : user.username;
    } else if (
      user.role === UserRole.LIBRARIAN ||
      user.role === UserRole.ACCOUNTANT
    ) {
      // For staff members, try to get school name for better identification
      if (user.school) {
        const school = await this.schoolModel.findById(user.school).exec();
        if (school) {
          fullName = `${user.username} (${school.schoolName})`;
        } else {
          fullName = user.username;
        }
      } else {
        fullName = user.username;
      }
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

  async getStaffSchoolContext(
    userId: string,
  ): Promise<{ schoolId?: string; schoolName?: string }> {
    try {
      // This method helps find the school context for staff members
      // It can be called after login to get additional school information
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        return {};
      }

      if (
        user.role === UserRole.LIBRARIAN ||
        user.role === UserRole.ACCOUNTANT
      ) {
        // For staff members, get school context from user.school field
        if (user.school) {
          const school = await this.schoolModel.findById(user.school).exec();
          if (school) {
            return {
              schoolId: school._id.toString(),
              schoolName: school.schoolName,
            };
          }
        }
        return {};
      }

      return {};
    } catch (error) {
      return {};
    }
  }
  async getLoggedInUser(userId: any): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .populate('school', 'schoolName')
      .exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.enhanceUserWithDetails(user);
  }
  private async enhanceUserWithDetails(user: any): Promise<any> {
    let detailedInfo: any = null;

    // Get detailed information based on role
    switch (user.role) {
      case UserRole.LIBRARIAN:
        const librarian = await this.librarianModel
          .findOne({
            accountCredentails: user._id,
          })
          .populate('school', 'schoolName')
          .exec();
        detailedInfo = librarian;
        break;

      case UserRole.ACCOUNTANT:
        const accountant = await this.accountantModel
          .findOne({
            accountCredentails: user._id,
          })
          .populate('school', 'schoolName')
          .exec();
        detailedInfo = accountant;
        break;

      case UserRole.TEACHER:
        const teacher = await this.teacherModel
          .findOne({
            accountCredentails: user._id,
          })
          .populate('school', 'schoolName')
          .exec();
        detailedInfo = teacher;
        break;
      case UserRole.STUDENT:
        const student = await this.studentModel
          .findOne({
            accountCredentails: user._id,
          })
          .populate('school', 'schoolName')
          .exec();
        detailedInfo = student;
        break;
      case UserRole.SCHOOL_ADMIN:
        const schoolAdmin = await this.userModel
          .findOne({
            _id: user._id,
          })
          .populate('school')
          .exec();
        detailedInfo = schoolAdmin;
        break;

      default:
        break;
    }

    return {
      ...user.toObject(),
      detailedInfo,
      fullName: detailedInfo
        ? `${detailedInfo.firstName} ${detailedInfo.lastName}`
        : user.username,
      department: detailedInfo?.department || 'N/A',
      status: detailedInfo?.status || 'N/A',
      employmentType: detailedInfo?.employmentType || 'N/A',
      hiredDate: detailedInfo?.hiredDate || 'N/A',
      qualifications: detailedInfo?.qualifications || 'N/A',
      experience: detailedInfo?.experience || 'N/A',
      specialization: detailedInfo?.specialization || 'N/A',
      workingHours: detailedInfo?.workingHours || 'N/A',
      profilePicture: detailedInfo?.profilePicture || user.profileImage || null,
    };
  }
}
