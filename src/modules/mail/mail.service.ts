import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}
    async sendAccountInfoEmail(

        to: string,
        fullName: string,
        password: string,
        role: string,
      ) {
        await this.mailerService.sendMail({
          to,
          subject: 'Your Account Information – School Management System',
          template: 'account-info',
          context: {
            fullName,
            email: to,
            password,
            role,
            contactEmail: 'admin@example.edu',
            year: new Date().getFullYear(),
          },
        });
      }
      
}
