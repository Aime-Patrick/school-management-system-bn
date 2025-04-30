import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CreateTermDto } from './dto/create-term.dto';
import { TermService } from './terms.service';
import { UserRole } from 'src/schemas/user.schema';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UpdateTermDto } from './dto/update-term.dto';


@ApiTags('terms')
@Roles(UserRole.SCHOOL_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academic/terms')
export class TermController {
  constructor(private readonly termService: TermService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new term', description: 'Create a new term record.' })
  createTerm(@Body() createTermDto: CreateTermDto) {
    return this.termService.createTerm(createTermDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all terms', description: 'Retrieve all terms for the school.' })
  getAllTerms() {
    return this.termService.getAllTerms();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get term by ID', description: 'Retrieve a term by its ID.' })
  getTermById(@Param('id') id: string) {
    return this.termService.getTermById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update term', description: 'Update a term record by their ID.' })
  updateTerm(@Param('id') id: string, @Body() updateTermDto: UpdateTermDto) {
    return this.termService.updateTerm(id, updateTermDto);
  }
}

