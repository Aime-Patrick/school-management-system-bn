import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission, PermissionSchema } from '../../schemas/permission.schema';
import { UserPermission, UserPermissionSchema } from '../../schemas/user-permission.schema';
import { PermissionProfile, PermissionProfileSchema } from '../../schemas/permission-profile.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { School, SchoolSchema } from '../../schemas/school.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: PermissionProfile.name, schema: PermissionProfileSchema },
      { name: User.name, schema: UserSchema },
      { name: School.name, schema: SchoolSchema },
    ]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
