import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { UtilsModule } from '../../utils/utils.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { Teacher, TeacherSchema} from 'src/schemas/teacher.schema';
import { Student, StudentSchema } from 'src/schemas/student.schema';
import { School, SchoolSchema } from 'src/schemas/school.schema';
import { MailModule } from '../mail/mail.module';
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory:  (config : ConfigService) => ({
            secret: config.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '1h' },
        }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }]),
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
    MongooseModule.forFeature([{ name: School.name, schema: SchoolSchema }]),
    UtilsModule,
    MailModule,
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
