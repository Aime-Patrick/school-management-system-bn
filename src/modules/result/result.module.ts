import { Module } from '@nestjs/common';
import { Result, ResultSchema } from 'src/schemas/result.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
import { Student, StudentSchema } from 'src/schemas/student.schema';
import { Class, ClassSchema } from 'src/schemas/class.schema';
@Module({
    imports: [MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema },
        { name: Student.name, schema: StudentSchema },
        { name: Class.name, schema: ClassSchema },
    ])],
    controllers: [ResultController],
    providers: [ResultService],
    exports: [ResultService]
})
export class ResultModule {}
