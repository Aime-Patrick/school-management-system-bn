import { Module } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { Academic, AcademicSchema } from 'src/schemas/academic-year.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AcademicController } from './academic.controller';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
@Module({
  imports:[
    MongooseModule.forFeature([{name: Academic.name, schema:AcademicSchema}]),
  ],
  providers: [AcademicService],
  exports:[AcademicService],
  controllers: [AcademicController],
})
export class AcademicModule {}
