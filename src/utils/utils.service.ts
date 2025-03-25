import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class HashService {

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
}
