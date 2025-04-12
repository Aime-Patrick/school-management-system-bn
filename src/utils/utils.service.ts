import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
}
@Injectable()
export class HashService {
    constructor(
         private configService: ConfigService,
    ) {
        
        cloudinary.config({
          cloud_name: this.configService.get<string>("CLOUDINARY_CLOUD_NAME"),
          api_key: this.configService.get<string>("CLOUDINARY_API_KEY"),
          api_secret: this.configService.get<string>("CLOUDINARY_API_SECRET"),
        });
      }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

     generatePassword(base: string): string {
        const randomString = crypto.randomBytes(3).toString('hex');
        const mixedCaseString = randomString.split('').map(char => {
            return Math.random() > 0.5 ? char.toUpperCase() : char;
        }).join('');
        return `${base}-${mixedCaseString}`;
    }

     generateUsernameForStudent(firstName: string, StudentRegNumber: string): string {
        const randomString = crypto.randomBytes(2).toString('hex');
        return `${firstName.toLowerCase()}-${StudentRegNumber}-${randomString}`;
      }

      generatorRegistrationNumber(schoolCode: string, year: number, studentCount: number): string {
        const paddedCount = String(studentCount + 1).padStart(5, '0');
        return `${schoolCode}${year}${paddedCount}`;
      }

      generateUsernameForTeacher(firstName: string, lastName: string): string {
        const randomString = crypto.randomBytes(2).toString('hex');
        return `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${randomString}`;
      }
      
      async uploadFileToCloudinary(file: Express.Multer.File): Promise<UploadedFile> {
        if (!file || !file.originalname) {
          throw new Error('No file uploaded');
        }
      
        const supportedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.pdf'];
      
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!supportedExtensions.includes(fileExtension)) {
          throw new Error(`Unsupported file type: ${fileExtension}`);
        }
      
        const tempFilePath = path.join(__dirname, `temp-${uuidv4()}${fileExtension}`);
        await fs.writeFile(tempFilePath, file.buffer);
      
        const result = await cloudinary.uploader.upload(tempFilePath, {
          folder: 'school-management-mis',
          resource_type: 'auto',
        });
      
        await fs.unlink(tempFilePath);
      
        return {
          name: result.public_id,
          url: result.secure_url,
          type: result.format,
          size: result.bytes,
          ...(result.width && result.height ? { width: result.width, height: result.height } : {}),
        };
      }      
}
