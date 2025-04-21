import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/schemas/user.schema';

@ApiTags('Subscription Plans')
@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @Roles(UserRole.SYSTEM_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription plan' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiOperation({ summary: 'Create a new subscription plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  create(@Body() dto: CreateSubscriptionPlanDto) {
    return this.planService.createSubscriptionPlan(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  getAll() {
    return this.planService.getAllSubscriptionPlan();
  }

  @Put(':id/add-features')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Content added successfully' })
  @ApiResponse({ status: 404, description: 'Subscription plan not found' })
  @ApiResponse({ status: 400, description: 'Invalid content to add' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Add content to a subscription plan' })
  @ApiResponse({ status: 200, description: 'Content added successfully' })
  addContent(
    @Param('id') id: string,
    @Body('newContent') newContent: string[],
  ) {
    return this.planService.addContentToSubscription(id, newContent);
  }

  @Put(':id/remove-features')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({ status: 200, description: 'Content removed successfully' })
  @ApiResponse({ status: 404, description: 'Subscription plan not found' })
  @ApiResponse({ status: 400, description: 'Invalid content to remove' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiOperation({ summary: 'Remove content from a subscription plan' })
  @ApiResponse({ status: 200, description: 'Content removed successfully' })
  removeContent(
    @Param('id') id: string,
    @Body('contentToRemove') contentToRemove: string[],
  ) {
    return this.planService.removeContentFromSubscription(id, contentToRemove);
  }

  @Delete(':id')
  @Roles(UserRole.SYSTEM_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({ status: 200, description: 'Subscription plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subscription plan not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a subscription plan' })
  delete(@Param('id') id: string) {
    return this.planService.deleteSubscriptionPlan(id);
  }

  @Patch(':id')
  @Roles(UserRole.SYSTEM_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({ status: 200, description: 'Subscription plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Subscription plan not found' })
  @ApiResponse({ status: 400, description: 'Invalid subscription plan' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a subscription plan' })
  update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateSubscriptionPlanDto>,
  ) {
    return this.planService.updateSubscriptionPlan(id, updateDto);
  }

  @Put(':id/activate-subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({ status: 200, description: 'Subscription plan activated successfully' })
  @ApiResponse({ status: 404, description: 'School not found' })
  @ApiResponse({ status: 400, description: 'Invalid subscription plan' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiOperation({ summary: 'Activate a subscription plan' })
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate a subscription plan' })
  async activateSubscription(
    @Param('id') schoolId: string,
  ): Promise<{ message: string }> {
    const result = await this.planService.activateSubscription(schoolId);
    return { message: result };
  }
}
