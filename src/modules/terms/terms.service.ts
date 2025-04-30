import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Term } from 'src/schemas/terms.schama';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';

@Injectable()
export class TermService {
  constructor(@InjectModel(Term.name) private termModel: Model<Term>) {}

  async createTerm(createTermDto: CreateTermDto): Promise<Term> {
    return await this.termModel.create(createTermDto);
  }

  async getAllTerms(): Promise<Term[]> {
    return await this.termModel.find().populate('academicYear').exec();
  }

  async getTermById(id: string): Promise<Term | null> {
    return await this.termModel.findById(id).exec();
  }

  async updateTerm(id: string, updateTermDto: UpdateTermDto): Promise<Term | null> {
    return await this.termModel.findByIdAndUpdate(id, updateTermDto, { new: true }).populate('academicYear').exec();
  }

  async deleteTerm(id: string): Promise<boolean> {
    const result = await this.termModel.findByIdAndDelete(id).exec();
    return!!result;
  }
}

