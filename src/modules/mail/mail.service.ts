import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MailService {
    constructor(
      private readonly mailerService: MailerService,
      private readonly configService: ConfigService,
    ) {}
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
      async sendPasswordResetEmail(
        to: string,
        fullName: string,
        resetToken: string,
      ) {
        await this.mailerService.sendMail({
          to,
          subject: 'Password Reset Request – School Management System',
          template: 'password-reset',
          context: {
            fullName,
            resetToken,
            year: new Date().getFullYear(),
            contactEmail: 'support@example.com',
            resetUrlBase: this.configService.get<string>('FRONTEND_RESET_URL')
          },
        });
      }
}
