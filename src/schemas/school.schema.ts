import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose ,{ Types, Model } from "mongoose";
import { User } from "./user.schema";
import { Teacher } from "./teacher.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Student } from "./student.schema";
import { Course } from "./course.schema";

@Schema({ timestamps: true })
export class School {
  @Prop({required: true})
  schoolLogo: string

  @Prop({ required: true, unique: true })
  schoolName: string;

  @Prop({ required: true, unique: true })
  schoolCode: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) 
  schoolAdmin: User;

  @Prop({ required: true , enum: ["active", "disactive"], default: "active" })
  status : "active" | "disactive"

  @Prop({required: false})
  activeUntil: Date;
}

export const SchoolSchema = SchemaFactory.createForClass(School);

SchoolSchema.pre('findOneAndDelete', async function (next) {
  const schoolId = (this as any)._conditions._id; // Safely get school ID

  if (!schoolId) {
    return next(new Error('School ID not found in query'));
  }

  const TeacherModel = mongoose.model('Teacher'); 
  const StudentModel = mongoose.model('Student');
  const CourseModel = mongoose.model('Course');

  // Ensure models have deleteMany method
  if (TeacherModel && StudentModel && CourseModel) {
    await TeacherModel.deleteMany({ school: schoolId });
    await StudentModel.deleteMany({ school: schoolId });
    await CourseModel.deleteMany({ school: schoolId });
  }

  next();
});

