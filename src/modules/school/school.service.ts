import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { School } from 'src/schemas/school.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSchoolDto } from './dto/create-school.dto';
import { User } from 'src/schemas/user.schema';
@Injectable()
export class SchoolService {
    constructor(
        @InjectModel(School.name) private schoolModel: Model<School>,
        @InjectModel(User.name) private userModel: Model<User>,
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
      
}
