import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assignment, AssignmentStatus, SubmissionStatus } from '../../schemas/assignment.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ClassCombination } from '../../schemas/ClassCombination.schema';
import { Class } from '../../schemas/class.schema';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(Class.name) private classModel: Model<Class>,
    @InjectModel(ClassCombination.name) private classCombinationModel: Model<ClassCombination>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createAssignment(
    createAssignmentDto: CreateAssignmentDto,
    teacherId: string,
    schoolId: string,
    files?: Express.Multer.File[],
  ): Promise<Assignment> {
    const {
      title,
      description,
      dueDate,
      course,
      term,
      classId,
      classCombinationIds = [],
      assignToAllCombinations = true,
      assignedStudents = [],
      maxScore = 100,
      instructions,
      allowLateSubmission = false,
      lateSubmissionPenalty = 0,
      allowedFileTypes = ['pdf', 'doc', 'docx'],
      maxFileSize = 10,
      maxFilesPerSubmission = 5,
      status = AssignmentStatus.DRAFT,
    } = createAssignmentDto;

    // Validate due date
    if (new Date(dueDate) <= new Date()) {
      throw new BadRequestException('Due date must be in the future');
    }

    // Get students from class combinations
    let studentsFromCombinations: string[] = [];
    
    if (classId) {
      if (assignToAllCombinations) {
        // Get all combinations in the class and their students
        const classCombinations = await this.classCombinationModel
          .find({ parentClass: new Types.ObjectId(classId) })
          .populate('students')
          .exec();
        
        studentsFromCombinations = classCombinations.flatMap(combination => 
          combination.students.map(student => student._id.toString())
        );
      } else if (classCombinationIds.length > 0) {
        // Get students from specific combinations
        const classCombinations = await this.classCombinationModel
          .find({ 
            _id: { $in: classCombinationIds.map(id => new Types.ObjectId(id)) },
            parentClass: new Types.ObjectId(classId)
          })
          .populate('students')
          .exec();
        
        studentsFromCombinations = classCombinations.flatMap(combination => 
          combination.students.map(student => student._id.toString())
        );
      }
    }

    // Combine students from combinations and directly assigned students
    const allAssignedStudents = [...new Set([...studentsFromCombinations, ...assignedStudents])];
    
    if (allAssignedStudents.length === 0) {
      throw new BadRequestException('No students assigned. Please provide classId with combinations or assignedStudents');
    }

    // Upload teacher attachments if provided
    const attachments: any[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        // Validate file type
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase() || '';
        if (!allowedFileTypes.includes(fileExtension)) {
          throw new BadRequestException(
            `File type ${fileExtension} is not allowed. Allowed types: ${allowedFileTypes.join(', ')}`,
          );
        }

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSize) {
          throw new BadRequestException(
            `File size ${fileSizeMB.toFixed(2)}MB exceeds maximum allowed size of ${maxFileSize}MB`,
          );
        }

        // Upload to Cloudinary
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        
        attachments.push({
          fileName: uploadResult.public_id,
          originalName: file.originalname,
          fileUrl: uploadResult.secure_url,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
          uploadedBy: new Types.ObjectId(teacherId),
        });
      }
    }

    // Initialize submissions for assigned students
    const submissions = allAssignedStudents.map(studentId => ({
      student: new Types.ObjectId(studentId),
      status: SubmissionStatus.PENDING,
      dueDate: new Date(dueDate),
      score: 0,
      maxScore,
      files: [],
    }));

    const assignment = new this.assignmentModel({
      title,
      description,
      dueDate: new Date(dueDate),
      course: new Types.ObjectId(course),
      term: new Types.ObjectId(term),
      school: new Types.ObjectId(schoolId),
      teacher: new Types.ObjectId(teacherId),
      maxScore,
      instructions,
      allowLateSubmission,
      lateSubmissionPenalty,
      allowedFileTypes,
      maxFileSize,
      maxFilesPerSubmission,
      assignedStudents: assignedStudents.map(id => new Types.ObjectId(id)),
      status,
      attachments,
      submissions,
    });

    return assignment.save();
  }

  async submitAssignment(
    assignmentId: string,
    studentId: string,
    submitDto: SubmitAssignmentDto,
    files?: Express.Multer.File[],
  ): Promise<Assignment> {
    const assignment = await this.assignmentModel.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if student is assigned to this assignment
    const studentSubmission = assignment.submissions.find(
      sub => sub.student.toString() === studentId,
    );
    if (!studentSubmission) {
      throw new ForbiddenException('You are not assigned to this assignment');
    }

    // Check if already submitted
    if (studentSubmission.status === SubmissionStatus.SUBMITTED || 
        studentSubmission.status === SubmissionStatus.OVERDUE) {
      throw new BadRequestException('Assignment already submitted');
    }

    // Check if due date has passed
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;

    if (isLate && !assignment.allowLateSubmission) {
      throw new BadRequestException('Assignment due date has passed and late submissions are not allowed');
    }

    // Upload student files if provided
    const uploadedFiles: any[] = [];
    if (files && files.length > 0) {
      // Validate number of files
      if (files.length > assignment.maxFilesPerSubmission) {
        throw new BadRequestException(
          `Maximum ${assignment.maxFilesPerSubmission} files allowed per submission`,
        );
      }

      for (const file of files) {
        // Validate file type
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase() || '';
        if (!assignment.allowedFileTypes.includes(fileExtension)) {
          throw new BadRequestException(
            `File type ${fileExtension} is not allowed. Allowed types: ${assignment.allowedFileTypes.join(', ')}`,
          );
        }

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > assignment.maxFileSize) {
          throw new BadRequestException(
            `File size ${fileSizeMB.toFixed(2)}MB exceeds maximum allowed size of ${assignment.maxFileSize}MB`,
          );
        }

        // Upload to Cloudinary
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        
        uploadedFiles.push({
          fileName: uploadResult.public_id,
          originalName: file.originalname,
          fileUrl: uploadResult.secure_url,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
          uploadedBy: new Types.ObjectId(studentId),
        });
      }
    }

    // Update submission
    studentSubmission.status = isLate ? SubmissionStatus.OVERDUE : SubmissionStatus.SUBMITTED;
    studentSubmission.submittedAt = new Date();
    studentSubmission.files = uploadedFiles;
    studentSubmission.comments = submitDto.comments;

    return assignment.save();
  }

  async gradeAssignment(
    assignmentId: string,
    studentId: string,
    teacherId: string,
    gradeDto: GradeAssignmentDto,
  ): Promise<Assignment> {
    const assignment = await this.assignmentModel.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if teacher owns this assignment
    if (assignment.teacher.toString() !== teacherId) {
      throw new ForbiddenException('You can only grade assignments you created');
    }

    const studentSubmission = assignment.submissions.find(
      sub => sub.student.toString() === studentId,
    );
    if (!studentSubmission) {
      throw new NotFoundException('Student submission not found');
    }

    // Check if assignment is submitted
    if (studentSubmission.status === SubmissionStatus.PENDING) {
      throw new BadRequestException('Cannot grade unsubmitted assignment');
    }

    // Apply late submission penalty if applicable
    let finalScore = gradeDto.score;
    if (studentSubmission.status === SubmissionStatus.OVERDUE && assignment.lateSubmissionPenalty > 0) {
      const penalty = (gradeDto.score * assignment.lateSubmissionPenalty) / 100;
      finalScore = Math.max(0, gradeDto.score - penalty);
    }

    // Update submission
    studentSubmission.status = SubmissionStatus.GRADED;
    studentSubmission.score = finalScore;
    studentSubmission.feedback = gradeDto.feedback;
    studentSubmission.gradedBy = new Types.ObjectId(teacherId);
    studentSubmission.gradedAt = new Date();

    return assignment.save();
  }

  async getAssignmentsByTeacher(teacherId: string, schoolId: string): Promise<Assignment[]> {
    return this.assignmentModel
      .find({
        teacher: new Types.ObjectId(teacherId),
        school: new Types.ObjectId(schoolId),
      })
      .populate('course', 'name')
      .populate('term', 'name')
      .populate('assignedStudents', 'firstName lastName registrationNumber')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAssignmentsByStudent(studentId: string, schoolId: string): Promise<Assignment[]> {
    return this.assignmentModel
      .find({
        'submissions.student': new Types.ObjectId(studentId),
        school: new Types.ObjectId(schoolId),
      })
      .populate('course', 'name')
      .populate('term', 'name')
      .populate('teacher', 'firstName lastName')
      .sort({ dueDate: 1 })
      .exec();
  }

  async getAssignmentById(assignmentId: string, userId: string, userRole: string): Promise<Assignment> {
    const assignment = await this.assignmentModel
      .findById(assignmentId)
      .populate('course', 'name')
      .populate('term', 'name')
      .populate('teacher', 'firstName lastName')
      .populate('assignedStudents', 'firstName lastName registrationNumber')
      .populate('submissions.student', 'firstName lastName registrationNumber')
      .populate('submissions.gradedBy', 'firstName lastName')
      .exec();

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Filter submissions based on user role
    if (userRole === 'student') {
      assignment.submissions = assignment.submissions.filter(
        sub => sub.student._id.toString() === userId,
      );
    }

    return assignment;
  }

  async updateAssignmentStatus(
    assignmentId: string,
    teacherId: string,
    status: AssignmentStatus,
  ): Promise<Assignment> {
    const assignment = await this.assignmentModel.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.teacher.toString() !== teacherId) {
      throw new ForbiddenException('You can only update assignments you created');
    }

    assignment.status = status;
    return assignment.save();
  }

  async deleteAssignment(assignmentId: string, teacherId: string): Promise<void> {
    const assignment = await this.assignmentModel.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.teacher.toString() !== teacherId) {
      throw new ForbiddenException('You can only delete assignments you created');
    }

    // Delete files from Cloudinary
    const allFiles = [
      ...assignment.attachments,
      ...assignment.submissions.flatMap(sub => sub.files),
    ];

    for (const file of allFiles) {
      await this.cloudinaryService.deleteFile(file.fileName);
    }

    await this.assignmentModel.findByIdAndDelete(assignmentId);
  }

  async getAssignmentByCourse(courseId: string): Promise<Assignment[]> {
    return await this.assignmentModel.find({ course: courseId }).populate(['teacher', 'term']).exec();
  }

  async getAssignmentByTeacher(teacherId: string): Promise<Assignment[]> {
    return await this.assignmentModel.find({ teacher: teacherId }).populate(['course', 'term']).exec();
  }

  async getPendingAssignments(teacherId: string): Promise<Assignment[]> {
    return await this.assignmentModel
      .find({ 
        teacher: teacherId, 
        status: AssignmentStatus.DRAFT 
      })
      .populate(['course', 'term'])
      .exec();
  }

  async getPublishedAssignments(teacherId: string): Promise<Assignment[]> {
    return await this.assignmentModel
      .find({ 
        teacher: teacherId, 
        status: AssignmentStatus.PUBLISHED 
      })
      .populate(['course', 'term'])
      .exec();
  }
  
  async getOverdueAssignments(teacherId: string): Promise<Assignment[]> {
    const now = new Date();
    return await this.assignmentModel
      .find({ 
        teacher: teacherId,
        dueDate: { $lt: now },
        status: AssignmentStatus.PUBLISHED
      })
      .populate(['course', 'term'])
      .exec();
  }

  async getSubmittedAssignments(teacherId: string): Promise<Assignment[]> {
    return await this.assignmentModel
      .find({ 
        teacher: teacherId,
        'submissions.status': { $in: ['submitted', 'overdue'] }
      })
      .populate(['course', 'term'])
      .exec();
  }
}
