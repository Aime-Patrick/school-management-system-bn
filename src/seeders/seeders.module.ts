import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederService } from './seeders.service';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersModule } from 'src/modules/users/users.module';
import { UtilsModule } from '../utils/utils.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule,
    UsersModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UtilsModule,
  ],
  providers: [SeederService, ],
})
export class SeedersModule {}
