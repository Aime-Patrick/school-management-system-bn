import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SchoolService } from './school.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { CreateSchoolDto } from './dto/create-school.dto';

@ApiTags('school')
@Controller('school')
export class SchoolController {
    constructor(private readonly schoolService: SchoolService) {}

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('school-admin')
    async createSchool(@Body() createSchoolDto: CreateSchoolDto, @Req() req) {
        try {
            const schoolAdmin = req.user.id;
            return await this.schoolService.createSchool(createSchoolDto, schoolAdmin)
        } catch (error) {
            throw new BadRequestException();
        }
    }
}
