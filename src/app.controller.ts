import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getWelcomeMessage(): string {
    return 'Welcome to the School Management System API!';
  }

  @Get('health')
  getHealthCheck(): { status: string } {
    return { status: 'OK' };
  }
}