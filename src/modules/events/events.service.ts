import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from 'src/schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private readonly eventModel: Model<Event>,
  ) {}

  // Create a new event
  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = new this.eventModel(createEventDto);
    return await event.save();
  }

  // Update an existing event
  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const updatedEvent = await this.eventModel.findByIdAndUpdate(id, updateEventDto, { new: true });
    if (!updatedEvent) {
      throw new Error(`Event not found`);
    }
    return updatedEvent;
  }

  // Get all events
  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  // Get events for a specific month
  async getEventsByMonth(month: number, year: number): Promise<Event[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return this.eventModel
      .find({
        date: { $gte: startDate, $lte: endDate },
      })
      .exec();
  }

  // Get an event by its ID
  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new Error(`Event with ID ${id} not found`);
    }
    return event;
  }
}
