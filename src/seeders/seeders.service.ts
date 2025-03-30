import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../schemas/user.schema';
import { HashService } from 'src/utils/utils.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private hashUtils: HashService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  async seedSuperAdmin() {
    const email = this.configService.get<string>('SYSTEM_EMAIL');
    const password = this.configService.get<string>('SYSTEM_PASSWORD');
    const username = this.configService.get<string>('SYSTEM_USERNAME');
    const phoneNumber = this.configService.get<string>('SYSTEM_PHONENUMBER');
    const existingSuperAdmin = await this.userModel.findOne({
      role: UserRole.SYSTEM_ADMIN,
    });
    const existingSuperAdminByEmail = await this.userModel.findOne({ email });

    if (!existingSuperAdmin && !existingSuperAdminByEmail) {
      if (!password) {
        throw new Error('SYSTEM_PASSWORD is not defined');
      }
      const hashedPassword = await this.hashUtils.hashPassword(password);

      const superAdmin = new this.userModel({
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        role: UserRole.SYSTEM_ADMIN,
      });

      await superAdmin.save();
      this.logger.log('✅ Super Admin created!');
    } else {
      this.logger.log('✅ Super Admin already exists.');
    }
  }
}
