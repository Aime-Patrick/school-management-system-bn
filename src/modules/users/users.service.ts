import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../../schemas/user.schema'
import { CreateUserDto } from './dto/create-user.dto';
import { HashService } from 'src/utils/utils.service';
import { CreateStudentDto } from '../students/dto/create-student.dto';
import { MailService } from '../mail/mail.service';
@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>,
    private hashUtils: HashService,
    private mailService: MailService
) {}
    
    async addSchoolAdmin(userData:CreateUserDto): Promise<User> {
        const hashedPassword = await this.hashUtils.hashPassword(userData.password)
        const newUser = new this.userModel({...userData,password:hashedPassword, role: UserRole.SCHOOL_ADMIN});
        await this.mailService.sendAccountInfoEmail(userData.email,userData.username, userData.password,UserRole.SCHOOL_ADMIN)
        return newUser.save();
    } 
      
    
    async findUserByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).select('-password').exec();
    }
    
    async findAllUsers(): Promise<User[]> {
        return (await this.userModel.find().select('-password').exec()).filter(user => user.role !== 'super-admin');
    }
}
