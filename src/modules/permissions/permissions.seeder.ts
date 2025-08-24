import { Injectable, OnModuleInit } from '@nestjs/common';
import { PermissionsService } from './permissions.service';

@Injectable()
export class PermissionsSeeder implements OnModuleInit {
  constructor(private readonly permissionsService: PermissionsService) {}

  async onModuleInit() {
    try {
      await this.permissionsService.seedDefaultPermissions();
      console.log('✅ Permissions system initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing permissions system:', error);
    }
  }
}
