import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../../schemas/user.schema'
import { CreateUserDto } from './dto/create-user.dto';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { HashService } from 'src/utils/utils.service';
import { CreateStudentDto } from '../students/dto/create-student.dto';
import { MailService } from '../mail/mail.service';
import { School } from '../../schemas/school.schema';
@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(School.name) private schoolModel: Model<School>,
        private hashUtils: HashService,
        private mailService: MailService
    ) {}
    
    async addSchoolAdmin(userData:CreateUserDto): Promise<User> {
        const hashedPassword = await this.hashUtils.hashPassword(userData.password)
        const newUser = new this.userModel({...userData,password:hashedPassword, role: UserRole.SCHOOL_ADMIN});
        await this.mailService.sendAccountInfoEmail(userData.email,userData.username, userData.password,UserRole.SCHOOL_ADMIN)
        return newUser.save();
    }

    async addLibrarian(userData: CreateStaffUserDto, schoolAdminId: string): Promise<User> {
        // Verify the school exists and the user is the school admin
        const school = await this.schoolModel.findOne({ 
            _id: new Types.ObjectId(userData.schoolId),
            schoolAdmin: new Types.ObjectId(schoolAdminId)
        }).exec();
        
        if (!school) {
            throw new BadRequestException('School not found or you are not authorized to manage this school');
        }

        const hashedPassword = await this.hashUtils.hashPassword(userData.password);
        
        // Create user with basic info
        const newUser = new this.userModel({
            username: userData.username,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            password: hashedPassword,
            role: UserRole.LIBRARIAN,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImage: '', // Will be set when profile image is uploaded
            mustChangePassword: true
        });

        const savedUser = await newUser.save();
        
        // Send account creation email
        await this.mailService.sendAccountInfoEmail(
            userData.email, 
            userData.username, 
            userData.password, 
            UserRole.LIBRARIAN
        );
        
        return savedUser;
    }

    async addAccountant(userData: CreateStaffUserDto, schoolAdminId: string): Promise<User> {
        // Verify the school exists and the user is the school admin
        const school = await this.schoolModel.findOne({ 
            _id: new Types.ObjectId(userData.schoolId),
            schoolAdmin: new Types.ObjectId(schoolAdminId)
        }).exec();
        
        if (!school) {
            throw new BadRequestException('School not found or you are not authorized to manage this school');
        }

        const hashedPassword = await this.hashUtils.hashPassword(userData.password);
        
        // Create user with basic info
        const newUser = new this.userModel({
            username: userData.username,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            password: hashedPassword,
            role: UserRole.ACCOUNTANT,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImage: '', // Will be set when profile image is uploaded
            mustChangePassword: true
        });

        const savedUser = await newUser.save();
        
        // Send account creation email
        await this.mailService.sendAccountInfoEmail(
            userData.email, 
            userData.username, 
            userData.password, 
            UserRole.ACCOUNTANT
        );
        
        return savedUser;
    } 
      
    
    async findUserByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).select('-password').exec();
    }
    
    async findAllUsers(): Promise<User[]> {
        return (await this.userModel.find().select('-password').exec()).filter(user => user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.SCHOOL_ADMIN);
    }

    async findUsersBySchool(schoolId: string): Promise<User[]> {
        // This method will be used when we have school association in user schema
        // For now, return users with roles that school admins can manage
        return await this.userModel.find({
            role: { $in: [UserRole.TEACHER, UserRole.LIBRARIAN, UserRole.ACCOUNTANT, UserRole.STUDENT] }
        }).select('-password').exec();
    }

    async findUsersBySchoolAdmin(schoolAdminId: string): Promise<User[]> {
        // Find the school managed by this admin
        const school = await this.schoolModel.findOne({ 
            schoolAdmin: new Types.ObjectId(schoolAdminId) 
        }).exec();
        
        if (!school) {
            throw new BadRequestException('School not found for this admin');
        }

        // Return users with roles that school admins can manage
        return await this.userModel.find({
            role: { $in: [UserRole.TEACHER, UserRole.LIBRARIAN, UserRole.ACCOUNTANT, UserRole.STUDENT] }
        }).select('-password').exec();
    }
}
