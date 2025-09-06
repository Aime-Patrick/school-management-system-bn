import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from './user.schema';
import { School } from './school.schema';

export enum LibrarianStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum LibrarianGender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum EmploymentType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
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

@Schema({ timestamps: true })
export class Librarian {
  @Prop({ type: mongoose.Schema.ObjectId, ref: 'User', required: true })
  accountCredentails: User;

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

  @Prop({ required: true, enum: LibrarianStatus })
  status: LibrarianStatus;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true, enum: LibrarianGender })
  gender: LibrarianGender;

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

  @Prop({ required: false })
  specialization: string[]; // e.g., "Children's Literature", "Digital Resources", "Cataloging"

  @Prop({ type: [String], required: false })
  certifications: string[]; // e.g., ["ALA Certification", "Digital Library Specialist"]

  @Prop({ required: false })
  workingHours: string; // e.g., "8:00 AM - 4:00 PM"

  @Prop({ type: EmergencyContact, required: false })
  emergencyContact: EmergencyContact;
}

export const LibrarianSchema = SchemaFactory.createForClass(Librarian);
