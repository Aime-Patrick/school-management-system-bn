import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Course } from 'src/schemas/course.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCourseDto } from './dto/create-course.dto';
import { School } from 'src/schemas/school.schema';
import { Teacher } from 'src/schemas/teacher.schema';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { UpdateCoursetDto } from './dto/updated-course.dto';
import { TeacherAssignedCourses } from './dto/teacher-assigned-course.dto';
import { User } from 'src/schemas/user.schema';
@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(School.name) private readonly schoolModel: Model<School>,
    @InjectModel(Teacher.name) private readonly teacherModel: Model<Teacher>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createCourse(
    course: CreateCourseDto,
    schoolAdmin: string,
  ): Promise<CreateCourseDto> {
    try {
      // Get the user and their school
      const user = await this.userModel.findById(schoolAdmin);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (!user.school) {
        throw new BadRequestException('User is not associated with any school');
      }

      // Get school details
      const school = await this.schoolModel.findById(user.school);
      if (!school) {
        throw new BadRequestException('School not found');
      }
      const createdCourse = await this.courseModel.create({
        ...course,
        school: school.id,
      });
      return createdCourse;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async assignTeacherToCourse(
    courseId: string,
    assignTeacherDto: AssignTeacherDto,
  ): Promise<Course> {
    console.log('Assigning teacher to course:', courseId, assignTeacherDto);

    // Validate course existence
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) throw new NotFoundException('Course not found');

    // Validate teacher IDs
    const validTeacherIds = assignTeacherDto.teachers.filter((teacherId) => {
      console.log('Validating teacher ID:', teacherId);
      if (!Types.ObjectId.isValid(teacherId)) {
        throw new BadRequestException(`Invalid teacher ID: ${teacherId}`);
      }
      return true;
    });

    // Merge and deduplicate teacher IDs
    const updatedTeacherIds = Array.from(
      new Set([...course.teacherIds.map((id) => id.toString()), ...validTeacherIds]),
    ).map((id) => new Types.ObjectId(id));

    // Update the course with the new teacher IDs
    const updatedCourse = await this.courseModel.findByIdAndUpdate(
      courseId,
      { teacherIds: updatedTeacherIds },
      { new: true },
    );

    // Update the teachers' coursesTaught field
    await this.teacherModel.updateMany(
      { _id: { $in: validTeacherIds } },
      { $addToSet: { coursesTaught: courseId } },
    );

    if (!updatedCourse) {
      throw new NotFoundException('Course not found');
    }
    return updatedCourse;
  }

  async getAllCourses(schoolAdmin: string): Promise<Course[]> {
    // Get the user and their school
    const user = await this.userModel.findById(schoolAdmin);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.school) {
      throw new NotFoundException('User is not associated with any school');
    }

    // Get school details
    const school = await this.schoolModel.findById(user.school);
    if (!school) {
      throw new NotFoundException('School not found');
    }
    return await this.courseModel
      .find({ school: school._id.toString() })
      .populate(['teacherIds', 'studentIds', 'school'])
      .exec();
  }

  async getCourseById(courseId: string): Promise<Course> {
    const course = await this.courseModel
      .findById(courseId)
      .populate(['teacherIds', 'studentIds'])
      .exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async updateCourse(
    courseId: string,
    updatedCourse: UpdateCoursetDto,
  ): Promise<Course> {
    const course = await this.courseModel
      .findByIdAndUpdate(courseId, updatedCourse, { new: true })
      .populate(['teacherIds', 'studentIds'])
      .exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async deleteCourse(courseId: string): Promise<void> {
    await this.courseModel.findByIdAndDelete(courseId).exec();
  }

  async getCourseByCourseCode(courseCode: string): Promise<Course> {
    const course = await this.courseModel
      .findOne({ courseCode })
      .populate(['Teacher', 'Student'])
      .exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async getCourseByTeacher(teacher: string): Promise<Course[]> {
    const courses = await this.courseModel
      .find({ teacherIds: teacher })
      .populate('teacherIds')
      .populate('studentIds')
      .populate('school')
      .exec();
    if (!courses) {
      throw new NotFoundException('No courses found for this teacher');
    }
    return courses;
  }
}
