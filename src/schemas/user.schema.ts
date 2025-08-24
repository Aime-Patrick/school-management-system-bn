import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';


export enum UserRole {
    SYSTEM_ADMIN = 'system-admin',
    SCHOOL_ADMIN = 'school-admin',
    TEACHER = 'teacher',
    STUDENT = 'student',
    PARENT = 'parent',
    ACCOUNTANT = 'accountant',
    LIBRARIAN = 'librarian',
  }
  

@Schema({ timestamps: true }) 
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: function(){
    return this.role !== UserRole.STUDENT;
  }, unique: true, sparse: true }) // Added unique: true and sparse: true
  email: string;

  @Prop({ required: function(){
    return this.role !== UserRole.STUDENT;
  }, unique: true })
  phoneNumber: string;

  @Prop({ required: true })
  password: string;

  @Prop({required: true, enum: UserRole})
    role: string;
  @Prop({required: false})
  profileImage: string;

  @Prop({ required: false, type: String })
  resetPasswordToken: string;

  @Prop({ required: false, type: Date })
  resetPasswordExpires: Date;

  @Prop({ required: true, default: false })
  mustChangePassword: boolean;

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'School', 
    required: function() {
      return this.role !== UserRole.SYSTEM_ADMIN;
    },
    validate: {
      validator: function(school: any) {
        // System admin can be school-less, others must have school
        if (this.role === UserRole.SYSTEM_ADMIN) {
          return true;
        }
        return school != null;
      },
      message: 'School is required for all users except system-admin'
    }
  })
  school?: Types.ObjectId; // School assignment for all users except system-admin
}

export const UserSchema = SchemaFactory.createForClass(User);
