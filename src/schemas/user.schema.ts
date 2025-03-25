import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


export enum UserRole {
    SYSTEM_ADMIN = 'system-admin',
    SCHOOL_ADMIN = 'school-admin',
    TEACHER = 'teacher',
    STUDENT = 'student',
    PARENT = 'parent',
  }
  

@Schema({ timestamps: true }) 
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: function(){
    return this.role !== UserRole.STUDENT;
  }, unique: true })
  email: string;

  @Prop({ required: function(){
    return this.role !== UserRole.STUDENT;
  }, unique: true })
  phoneNumber: string;

  @Prop({ required: true })
  password: string;

  @Prop({required: true, enum: UserRole})
    role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
