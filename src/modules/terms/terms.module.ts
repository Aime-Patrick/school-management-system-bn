import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Term, TermSchema } from 'src/schemas/terms.schama';
import { TermController } from './terms.controller';
import { TermService } from './terms.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Term.name, schema: TermSchema }])],
    controllers: [TermController],
    providers: [TermService]
})
export class TermsModule {}
