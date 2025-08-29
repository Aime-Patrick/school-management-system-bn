import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from './user.schema';
import { School } from './school.schema';

export enum AccountantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AccountantGender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum EmploymentType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
}

export enum AccountingSpecialization {
  GENERAL = 'General Accounting',
  PAYROLL = 'Payroll Specialist',
  TAX = 'Tax Specialist',
  AUDIT = 'Audit Specialist',
  BUDGET = 'Budget Planning',
  FINANCIAL_REPORTING = 'Financial Reporting',
}

// Define the emergency contact schema
@Schema({ _id: false })
export class EmergencyContact {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  relationship: string;

  @Prop({ required: true })
  phoneNumber: string;
}

// Define the bank account info schema
@Schema({ _id: false })
export class BankAccountInfo {
  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  routingNumber: string;
}

@Schema({ timestamps: true })
export class Accountant {
  @Prop({ type: mongoose.Schema.ObjectId, ref: 'User', required: true })
  accountCredentials: User;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  hiredDate: Date;

  @Prop({ required: true, enum: AccountantStatus })
  status: AccountantStatus;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true, enum: AccountantGender })
  gender: AccountantGender;

  @Prop({ required: true, enum: EmploymentType })
  employmentType: EmploymentType;

  @Prop({ required: true })
  qualifications: string;

  @Prop({ required: true })
  experience: string;

  @Prop({ type: mongoose.Schema.ObjectId, ref: 'School', required: true })
  school: School;

  @Prop({ required: false })
  profilePicture: string;

  @Prop({ required: false, enum: AccountingSpecialization })
  specialization: AccountingSpecialization;

  @Prop({ type: [String], required: false })
  certifications: string[]; // e.g., ["CPA", "CMA", "QuickBooks Certified"]

  @Prop({ required: false })
  workingHours: string; // e.g., "8:00 AM - 4:00 PM"

  @Prop({ type: EmergencyContact, required: false })
  emergencyContact: EmergencyContact;

  @Prop({ type: [String], required: false })
  softwareProficiency: string[]; // e.g., ["QuickBooks", "Excel", "Sage"]

  @Prop({ required: false })
  taxId: string; // Professional tax identification number

  @Prop({ type: BankAccountInfo, required: false })
  bankAccountInfo: BankAccountInfo;
}

export const AccountantSchema = SchemaFactory.createForClass(Accountant);
