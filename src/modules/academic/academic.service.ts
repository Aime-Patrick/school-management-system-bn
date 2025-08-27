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
    async getAllAcademicYears(schoolId: string) {
        try {
            return await this.academicModel.find({ school: schoolId }).populate('school');
        } catch (error) {
            throw error;
        }
    }

    async createAcademicYear(academicYear: CreateAcademicDto, schoolId:string): Promise<Academic> {
        try {
            // Validate that end date is after start date
            if (new Date(academicYear.endDate) <= new Date(academicYear.startDate)) {
                throw new Error('End date must be after start date');
            }

            const startYear = new Date(academicYear.startDate).getFullYear();
            const endYear = new Date(academicYear.endDate).getFullYear();

            const newAcademicYear = new this.academicModel({...academicYear, name:`${startYear}-${endYear}`, school:schoolId});
            return await newAcademicYear.save();
        } catch (error) {
            throw new Error('Failed to create academic year');
        }
    }

    async updateAcademicYear(id: string, academicYear: UpdateAcademicDto, schoolId: string): Promise<Academic> {
        try {
            // Get the current academic year to use existing dates if not provided
            const currentAcademicYear = await this.academicModel.findOne({ _id: id, school: schoolId });
            if (!currentAcademicYear) {
                throw new Error('Academic year not found');
            }

            // Use provided dates or fall back to existing ones
            const startDate = academicYear.startDate || currentAcademicYear.startDate;
            const endDate = academicYear.endDate || currentAcademicYear.endDate;

            // Validate that end date is after start date
            if (new Date(endDate) <= new Date(startDate)) {
                throw new Error('End date must be after start date');
            }

            // Recalculate the name based on the dates
            const startYear = new Date(startDate).getFullYear();
            const endYear = new Date(endDate).getFullYear();
            const updatedName = `${startYear}-${endYear}`;

            const updatedAcademicYear = await this.academicModel.findByIdAndUpdate(
                id, 
                { 
                    ...academicYear, 
                    name: updatedName 
                }, 
                { new: true }
            );
            
            if (!updatedAcademicYear) {
                throw new Error('Failed to update academic year');
            }
            return updatedAcademicYear;
        } catch (error) {
            throw error;
        }
    }
    async deleteAcademicYear(id: string, schoolId: string): Promise<{ message: string }> {
        try {
            const deletedAcademicYear = await this.academicModel.findOneAndDelete({ _id: id, school: schoolId });
            if (!deletedAcademicYear) {
                throw new Error('Academic year not found');
            }
            return { message: 'Academic year deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
    async getAcademicYearById(id: string, schoolId: string): Promise<Academic> {
        try {
            const academicYear = await this.academicModel.findOne({ _id: id, school: schoolId });
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
            const academicYears = await this.academicModel.find({ school: schoolId });
            if (!academicYears) {
                throw new Error('No academic years found for this school');
            }
            return academicYears;
        } catch (error) {
            throw error;
        }
    }
}
