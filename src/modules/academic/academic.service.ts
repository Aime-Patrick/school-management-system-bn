import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Academic } from 'src/schemas/academic-year.schema';
import { CreateAcademicDto } from './dto/create-academic.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateAcademicDto } from './dto/update-academic.dto';

@Injectable()
export class AcademicService {
    constructor(
        @InjectModel(Academic.name) private academicModel: Model<Academic>,
    ) {}

    // Add your service methods here
    async getAllAcademicYears() {
        try {
            return await this.academicModel.find().populate('school');
        } catch (error) {
            throw error;
        }
    }

    async createAcademicYear(academicYear: CreateAcademicDto, schoolId:string): Promise<Academic> {
        try {
            const startYear = new Date(academicYear.startDate).getFullYear();
            const endYear = new Date(academicYear.endDate).getFullYear();

            const newAcademicYear = new this.academicModel({...academicYear, name:`${startYear}-${endYear}`, school:schoolId});
            return await newAcademicYear.save();
        } catch (error) {
            throw error;
        }
    }

    async updateAcademicYear(id: string, academicYear: UpdateAcademicDto): Promise<Academic> {
        try {
            const updatedAcademicYear = await this.academicModel.findByIdAndUpdate(id, academicYear, { new: true });
            if (!updatedAcademicYear) {
                throw new Error('Academic year not found');
            }
            return updatedAcademicYear;
        } catch (error) {
            throw error;
        }
    }
    async deleteAcademicYear(id: string): Promise<{ message: string }> {
        try {
            const deletedAcademicYear = await this.academicModel.findByIdAndDelete(id);
            if (!deletedAcademicYear) {
                throw new Error('Academic year not found');
            }
            return { message: 'Academic year deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
    async getAcademicYearById(id: string): Promise<Academic> {
        try {
            const academicYear = await this.academicModel.findById(id);
            if (!academicYear) {
                throw new Error('Academic year not found');
            }
            return academicYear;
        } catch (error) {
            throw error;
        }
    }
    async getAcademicYearBySchoolId(schoolId: string): Promise<Academic[]> {
        try {
            const academicYears = await this.academicModel.find({ schoolId });
            if (!academicYears) {
                throw new Error('No academic years found for this school');
            }
            return academicYears;
        } catch (error) {
            throw error;
        }
    }
}
