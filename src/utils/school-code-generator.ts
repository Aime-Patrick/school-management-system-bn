import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School } from '../schemas/school.schema';

@Injectable()
export class SchoolCodeGenerator {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<School>,
  ) {}

  /**
   * Generate a unique school code based on school name
   * Format: First 3 letters of each word + random 3 digits
   * Example: "Greenwood High School" -> "GHS789"
   */
  async generateSchoolCode(schoolName: string): Promise<string> {
    // Extract first 3 letters of each word
    const words = schoolName.split(' ').filter(word => word.length > 0);
    const prefix = words
      .map(word => word.substring(0, 3).toUpperCase())
      .join('')
      .substring(0, 6); // Limit to 6 characters

    // Generate random 3-digit number
    const randomDigits = Math.floor(Math.random() * 900) + 100; // 100-999

    const schoolCode = `${prefix}${randomDigits}`;

    // Check if code already exists
    const existingSchool = await this.schoolModel.findOne({ schoolCode });
    if (existingSchool) {
      // If code exists, try again with different random digits
      return this.generateSchoolCode(schoolName);
    }

    return schoolCode;
  }

  /**
   * Generate a simple school code with format: SCH + random 4 digits
   * Example: "SCH1234"
   */
  async generateSimpleSchoolCode(): Promise<string> {
    const randomDigits = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    const schoolCode = `SCH${randomDigits}`;

    // Check if code already exists
    const existingSchool = await this.schoolModel.findOne({ schoolCode });
    if (existingSchool) {
      // If code exists, try again
      return this.generateSimpleSchoolCode();
    }

    return schoolCode;
  }

  /**
   * Generate school code based on school name with year
   * Format: First 3 letters of each word + current year + random 2 digits
   * Example: "Greenwood High School" -> "GHS202412"
   */
  async generateSchoolCodeWithYear(schoolName: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    
    // Extract first 3 letters of each word
    const words = schoolName.split(' ').filter(word => word.length > 0);
    const prefix = words
      .map(word => word.substring(0, 3).toUpperCase())
      .join('')
      .substring(0, 4); // Limit to 4 characters

    // Generate random 2-digit number
    const randomDigits = Math.floor(Math.random() * 90) + 10; // 10-99

    const schoolCode = `${prefix}${currentYear}${randomDigits}`;

    // Check if code already exists
    const existingSchool = await this.schoolModel.findOne({ schoolCode });
    if (existingSchool) {
      // If code exists, try again with different random digits
      return this.generateSchoolCodeWithYear(schoolName);
    }

    return schoolCode;
  }
}
