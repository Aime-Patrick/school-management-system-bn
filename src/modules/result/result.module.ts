import { Module } from '@nestjs/common';
import { Result, ResultSchema } from 'src/schemas/result.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
@Module({
    imports: [MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }])],
    controllers: [ResultController],
    providers: [ResultService],
    exports: [ResultService]
})
export class ResultModule {}
