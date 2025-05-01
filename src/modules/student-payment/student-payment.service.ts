import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { StudentPayment } from 'src/schemas/student-payment';
import { CreateStudentPaymentDto } from './dto/record-student-payment.dto';
import { paymentStatus } from 'src/schemas/student-payment';
import { School } from 'src/schemas/school.schema';
import { Student } from 'src/schemas/student.schema';
import { Term } from 'src/schemas/terms.schama';
import { Academic } from 'src/schemas/academic-year.schema';
import { HashService } from 'src/utils/utils.service';

@Injectable()
export class StudentPaymentService {
  constructor(
    @InjectModel(StudentPayment.name) private readonly studentPaymentModel: Model<StudentPayment>,
    @InjectModel(School.name) private readonly schoolModel: Model<School>,
    @InjectModel(Student.name) private readonly studentModel: Model<Student>,
    @InjectModel(Term.name) private readonly termModel: Model<Term>,
    @InjectModel(Academic.name) private readonly academicYearModel: Model<Academic>,
    private hashService: HashService,
  ) {}

  // Create a new student payment
  async createStudentPayment(dto: CreateStudentPaymentDto, school:string, files:Express.Multer.File[]): Promise<{ message: string; payment: StudentPayment }> {
    try {
        const schoolExists = await this.schoolModel.findById( school );
      if (!schoolExists) {
        throw new NotFoundException('School not found');
      }
      const studentExists = await this.studentModel.findById(dto.studentId );
      if (!studentExists) {
        throw new NotFoundException('Student not found');
      }
        const termExists = await this.termModel.findById(dto.termId);
      if (!termExists) {
        throw new NotFoundException('Term not found');
      }
      const academicYearExists = await this.academicYearModel.findById(dto.academicId );
      if (!academicYearExists) {
        throw new NotFoundException('Academic year not found');
      }
       if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
          }
      
          const uploadedFiles = await Promise.all(
            files.map((file) => this.hashService.uploadFileToCloudinary(file)),
          );
          const urls = uploadedFiles.map((f) => f.url);
      const payment = await this.studentPaymentModel.create({...dto, schoolId: school, proof: urls });
      return { message: 'Student payment created successfully', payment };
    } catch (error) {
      throw error;
    }
  }

  async getAllStudentPayments(school: string): Promise<StudentPayment[]> {
    try {
      const query = { schoolId: new mongoose.Types.ObjectId(school) };
  
      const payments = await this.studentPaymentModel
        .find(query)
        .populate('schoolId', 'schoolName')
        .populate({
          path: 'studentId',
          select: 'firstName lastName registrationNumber class',
          populate: {
            path: 'class',
            select: 'name',
          },
        })
        .populate('termId', 'name')
        .populate('academicId', 'name')
        .exec();
  
      return payments;
    } catch (error) {
      console.error('Error retrieving student payments:', error);
      throw new NotFoundException('Failed to retrieve student payments');
    }
  }

  // Update the status of a student payment
  async updateStudentPaymentStatus(paymentId: string, status: paymentStatus): Promise<{ message: string; payment: StudentPayment }> {
    try {
      const payment = await this.studentPaymentModel.findById(paymentId);

      if (!payment) {
        throw new NotFoundException('Student payment not found');
      }

      if (payment.status === status) {
        throw new BadRequestException(`Payment is already ${status}`);
      }

      payment.status = status;
      await payment.save();

      const message = status === paymentStatus.PAID
        ? 'Student payment marked as paid successfully'
        : 'Student payment marked as unpaid successfully';

      return { message, payment };
    } catch (error) {
      throw error;
    }
  }


}