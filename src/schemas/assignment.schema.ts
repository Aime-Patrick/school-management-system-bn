import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Schema as MongooseSchema } from "mongoose";
import { Term } from "./terms.schama";
import { Teacher } from "./teacher.schema";
import { Course } from "./course.schema";
import { Student } from "./student.schema";

export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum SubmissionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  OVERDUE = 'overdue',
  GRADED = 'graded',
}

// File attachment schema
const FileAttachmentSchema = new MongooseSchema({
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: Types.ObjectId, ref: 'User', required: true },
}, { _id: true });

// Student submission schema
const StudentSubmissionSchema = new MongooseSchema({
  student: { type: Types.ObjectId, ref: 'Student', required: true },
  status: { 
    type: String, 
    enum: Object.values(SubmissionStatus), 
    default: SubmissionStatus.PENDING 
  },
  submittedAt: { type: Date },
  dueDate: { type: Date, required: true },
  score: { type: Number, default: 0 },
  maxScore: { type: Number, required: true },
  feedback: { type: String },
  gradedBy: { type: Types.ObjectId, ref: 'Teacher' },
  gradedAt: { type: Date },
  files: [FileAttachmentSchema],
  comments: { type: String },
}, { _id: true });

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Course;

  @Prop({ type: Types.ObjectId, ref: 'Teacher', required: true })
  teacher: Teacher;

  @Prop({ type: Types.ObjectId, ref: 'Term', required: true })
  term: Term;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  school: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ required: true, default: AssignmentStatus.DRAFT, enum: AssignmentStatus })
  status: AssignmentStatus;

  @Prop({ required: true, type: Number, default: 100 })
  maxScore: number;

  @Prop({ type: [FileAttachmentSchema], default: [] })
  attachments: {
    fileName: string;
    originalName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    uploadedBy: Types.ObjectId;
  }[];

  @Prop({ type: [StudentSubmissionSchema], default: [] })
  submissions: {
    student: Types.ObjectId;
    status: SubmissionStatus;
    submittedAt?: Date;
    dueDate: Date;
    score: number;
    maxScore: number;
    feedback?: string;
    gradedBy?: Types.ObjectId;
    gradedAt?: Date;
    files: {
      fileName: string;
      originalName: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
      uploadedAt: Date;
      uploadedBy: Types.ObjectId;
    }[];
    comments?: string;
  }[];

  @Prop({ type: [Types.ObjectId], ref: 'Student', default: [] })
  assignedStudents: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  allowLateSubmission: boolean;

  @Prop({ type: Number, default: 0 })
  lateSubmissionPenalty: number; // Percentage penalty for late submissions

  @Prop({ type: String })
  instructions: string;

  @Prop({ type: [String], default: [] })
  allowedFileTypes: string[]; // e.g., ['pdf', 'doc', 'docx', 'jpg', 'png']

  @Prop({ type: Number, default: 10 })
  maxFileSize: number; // in MB

  @Prop({ type: Number, default: 5 })
  maxFilesPerSubmission: number;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
