import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


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
}

export const UserSchema = SchemaFactory.createForClass(User);
