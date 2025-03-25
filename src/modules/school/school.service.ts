import { Injectable } from '@nestjs/common';
import { School } from 'src/schemas/school.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSchoolDto } from './dto/create-school.dto';
@Injectable()
export class SchoolService {
    constructor(@InjectModel(School.name) private schoolModel: Model<School>) {}

    async createSchool(createSchoolDto: CreateSchoolDto, schoolAdmin: string): Promise<School> {
        const createdSchool = new this.schoolModel({...createSchoolDto, schoolAdmin});
        return createdSchool.save();
    }
}
