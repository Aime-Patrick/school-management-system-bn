import { Schema as MongooseSchema, Types } from 'mongoose';

// Schedule schema
const ScheduleSchema = new MongooseSchema({
  subject: String,
  teacher: { type: Types.ObjectId, ref: 'Teacher' },
  startTime: String,
  endTime: String,
});

// Day schema
export const DaySchema = new MongooseSchema({
  day: String,
  date: String,
  schedule: [ScheduleSchema],
},{_id: false});