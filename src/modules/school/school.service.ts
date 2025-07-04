import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { School } from 'src/schemas/school.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSchoolDto } from './dto/create-school.dto';
import { User, UserRole } from 'src/schemas/user.schema';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { HashService } from 'src/utils/utils.service';
import { log } from 'console';
import { Teacher } from 'src/schemas/teacher.schema';

@Injectable()
export class SchoolService {
    constructor(
        @InjectModel(School.name) private schoolModel: Model<School>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
        private mailService: MailService,
        private hashUtils: HashService,
) {}

    async createSchool(createSchoolDto: CreateSchoolDto, schoolAdmin: string, uploadedFile:string): Promise<School> {
        const existingSchool = await this.schoolModel.findOne({
            $or: [{ schoolAdmin }, { schoolName: createSchoolDto.schoolName }, { schoolCode: createSchoolDto.schoolCode }]
        });
        
        if (existingSchool) {
            throw new ConflictException("A school with the same admin, name, or code already exists.");
        }
        const createdSchool = new this.schoolModel({...createSchoolDto, schoolAdmin, schoolLogo:uploadedFile});
        return (await createdSchool.save()).populate("schoolAdmin");
    }

    async findAllSchools(): Promise<School[]> {
        return await this.schoolModel.find().populate("schoolAdmin");
    }

    async findSchoolById(schoolId: string): Promise<School> {
        const school = await this.schoolModel.findById(schoolId).populate("schoolAdmin");
        if (!school) {
            throw new Error(`School with ID ${schoolId} not found.`);
        }
        return school;
    }

    async updateSchool(schoolAdmin: string, createSchoolDto: CreateSchoolDto): Promise<School> {
        const updatedSchool = await this.schoolModel.findOneAndUpdate({schoolAdmin}, {...createSchoolDto}, {new: true}).populate("schoolAdmin");
        if (!updatedSchool) {
            throw new Error(`School not found.`);
        }
        return updatedSchool;
    }

    async deleteSchool(schoolId: string): Promise<void> {
        await this.schoolModel.findByIdAndDelete(schoolId).exec();
    }

    isSchoolAdminHasSchool = async(userData: any):Promise<{schoolId:string, isSchoolExist:boolean}> =>{
        try {
            const isSchoolExist = await this.schoolModel.findOne({schoolAdmin: userData.id})
          return isSchoolExist ? {schoolId: isSchoolExist.id,isSchoolExist:true} : {schoolId: "",isSchoolExist:false}
        } catch (error) {
          throw error;
        }
    }

    async checkSchoolSubscription(schoolId: string) {
        const school = await this.schoolModel
          .findById(schoolId)
          .populate('subscriptionPlan');
    
        if (!school) {
          throw new NotFoundException('School not found');
        }
        const now = new Date();
        const isActive =
          school.isActive &&
          school.subscriptionStart &&
          school.subscriptionEnd &&
          now >= school.subscriptionStart &&
          now <= school.subscriptionEnd;
    
        return {
          isActive,
          plan: isActive ? school.subscriptionPlan : null,
        };
      }

      async resetTeacherPassword(teacherUserId: string, schoolAdminId: string): Promise<{ message: string }> {
        // Ensure the teacher belongs to the admin's school
        const school = await this.schoolModel.findOne({ schoolAdmin: schoolAdminId });
        if (!school) throw new NotFoundException('School not found');

        const teacher = await this.teacherModel.findById(teacherUserId);
        if (!teacher) throw new NotFoundException('Teacher user not found');

         if (teacher.school.toString() !== school._id.toString()) {
        throw new BadRequestException('Teacher does not belong to your school');
    }


        const user = await this.userModel.findOne({ _id: teacher.accountCredentails, role: UserRole.TEACHER });
        if (!user) {
            throw new NotFoundException('Teacher account credentials not found');
        }
        // Generate new password
        const newPassword = randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
        const hashedPassword = await this.hashUtils.hashPassword(newPassword);

        user.password = hashedPassword;
        await user.save();

        // Email the new password to the teacher
        await this.mailService.sendAccountInfoEmail(
            user.email,
            user.username,
            newPassword,
            user.role
        );

        return { message: 'Password reset and emailed to teacher.' };
    }
}
