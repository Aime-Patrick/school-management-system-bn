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
@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(School.name) private readonly schoolModel: Model<School>,
    @InjectModel(Teacher.name) private readonly teacherModel: Model<Teacher>,
  ) {}

  async createCourse(
    course: CreateCourseDto,
    schoolAdmin: string,
  ): Promise<CreateCourseDto> {
    try {
      const school = await this.schoolModel.findOne({ schoolAdmin });
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
  ) {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) throw new NotFoundException('Course not found');

    const updatedTeacherIds = Array.from(
      new Set([...course.teacherIds, ...assignTeacherDto.teachers]),
    );

    await this.courseModel.findByIdAndUpdate(
      courseId,
      { teacherIds: updatedTeacherIds },
      { new: true },
    );

    await this.teacherModel.updateMany(
      { _id: { $in: assignTeacherDto.teachers } },
      { $addToSet: { coursesTaught: courseId } },
    );
    return course;
  }

  async getAllCourses(schoolAdmin: string): Promise<Course[]> {
    const school = await this.schoolModel.findOne({ schoolAdmin });
    return await this.courseModel
      .find({ school })
      .populate(['teacherIds', 'studentIds', 'school'])
      .exec();
  }

  async getCourseById(courseId: string): Promise<Course> {
    const course = await this.courseModel
      .findById(courseId)
      .populate(['Teacher', 'Student'])
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
      .populate(['Teacher', 'Student'])
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
