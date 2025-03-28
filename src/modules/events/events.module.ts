import { Module } from '@nestjs/common';
import { EventService } from './events.service';
import { Event, EventSchema } from 'src/schemas/event.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './events.controller';
@Module({
  imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])],
  controllers: [EventController],
  exports: [EventService],
  providers: [EventService]
})
export class EventsModule {}
