import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags,ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guard/roles.guard';
import { CreateTeacherDto } from './dto/create-teacher.dto';
@ApiTags("teachers")
@Controller('teachers')
export class TeachersController {
    constructor(private readonly teacherService: TeachersService) {}

    @Post('add-teacher')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin')
    @ApiOperation({ summary: 'Add Teache in the school', description: 'Add a new teacher record.' })
    async createTeacher(@Req() req, @Body() teacherDto: CreateTeacherDto) {
        return this.teacherService.createTeacher(teacherDto,req.user.id);
    }
}
