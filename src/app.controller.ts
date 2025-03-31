import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getWelcomeMessage() {
    return {
        message: 'Welcome to the School Management System API!',
        version: '1.0.0',
        documentation: '/api/docs',
      };
  }
}