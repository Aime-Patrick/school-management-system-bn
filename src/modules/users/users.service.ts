import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../../schemas/user.schema'
import { CreateUserDto } from './dto/create-user.dto';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { HashService } from 'src/utils/utils.service';
import { CreateStudentDto } from '../students/dto/create-student.dto';
import { MailService } from '../mail/mail.service';
import { School } from '../../schemas/school.schema';
@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(School.name) private schoolModel: Model<School>,
        private hashUtils: HashService,
        private mailService: MailService
    ) {}
    
    async addSchoolAdmin(userData: CreateUserDto): Promise<User> {
        const hashedPassword = await this.hashUtils.hashPassword(userData.password);
        
        // School admin should have school assigned
        if (!userData.schoolId) {
            throw new BadRequestException('School ID is required for school admin');
        }
        
        const newUser = new this.userModel({
            ...userData,
            password: hashedPassword,
            role: UserRole.SCHOOL_ADMIN,
            school: userData.schoolId
        });
        
        await this.mailService.sendAccountInfoEmail(userData.email, userData.username, userData.password, UserRole.SCHOOL_ADMIN);
        return newUser.save();
    }

    async addLibrarian(userData: CreateStaffUserDto, schoolAdminId: string): Promise<User> {
        console.log(`🔍 Creating librarian for admin: ${schoolAdminId}`);
        
        // First, let's check if the admin user exists and get their details
        const adminUser = await this.userModel.findById(schoolAdminId).exec();
        if (!adminUser) {
            throw new BadRequestException('Admin user not found');
        }
        console.log(`👤 Admin user found: ${adminUser.username}, role: ${adminUser.role}`);
        
        // Get the school managed by this admin
        let school = await this.schoolModel.findOne({ 
            schoolAdmin: new Types.ObjectId(schoolAdminId)
        }).exec();
        
        console.log(`🏫 School lookup result:`, school ? `Found school: ${school.schoolName}` : 'No school found');
        
        if (!school) {
            throw new BadRequestException('School not found for this admin. Please ensure the school admin has a school assigned before creating staff members.');
        }

        const hashedPassword = await this.hashUtils.hashPassword(userData.password);
        
        // Ensure school exists before creating user
        if (!school || !school._id) {
            throw new BadRequestException('School not properly configured');
        }
        
        // Create user with basic info
        const newUser = new this.userModel({
            username: userData.username,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            password: hashedPassword,
            role: UserRole.LIBRARIAN,
            profileImage: '', // Will be set when profile image is uploaded
            mustChangePassword: true,
            school: school._id // Associate with the school using ObjectId
        });

        const savedUser = await newUser.save();
        
        // Send account creation email
        await this.mailService.sendAccountInfoEmail(
            userData.email, 
            userData.username, 
            userData.password, 
            UserRole.LIBRARIAN
        );
        
        return savedUser;
    }

    async addAccountant(userData: CreateStaffUserDto, schoolAdminId: string): Promise<User> {
        console.log(`🔍 Creating accountant for admin: ${schoolAdminId}`);
        
        // First, let's check if the admin user exists and get their details
        const adminUser = await this.userModel.findById(schoolAdminId).exec();
        if (!adminUser) {
            throw new BadRequestException('Admin user not found');
        }
        console.log(`👤 Admin user found: ${adminUser.username}, role: ${adminUser.role}`);
        
        // Get the school managed by this admin
        let school = await this.schoolModel.findOne({ 
            schoolAdmin: new Types.ObjectId(schoolAdminId)
        }).exec();
        
        console.log(`🏫 School lookup result:`, school ? `Found school: ${school.schoolName}` : 'No school found');
        
        if (!school) {
            throw new BadRequestException('School not found for this admin. Please ensure the school admin has a school assigned before creating staff members.');
        }

        const hashedPassword = await this.hashUtils.hashPassword(userData.password);
        
        // Ensure school exists before creating user
        if (!school || !school._id) {
            throw new BadRequestException('School not properly configured');
        }
        
        // Create user with basic info
        const newUser = new this.userModel({
            username: userData.username,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            password: hashedPassword,
            role: UserRole.ACCOUNTANT,
            profileImage: '', // Will be set when profile image is uploaded
            mustChangePassword: true,
            school: school._id // Associate with the school using ObjectId
        });

        const savedUser = await newUser.save();
        
        // Send account creation email
        await this.mailService.sendAccountInfoEmail(
            userData.email, 
            userData.username, 
            userData.password, 
            UserRole.ACCOUNTANT
        );
        
        return savedUser;
    }


      
    
    async findUserByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).select('-password').exec();
    }
    
    async findAllUsers(): Promise<User[]> {
        return (await this.userModel.find().select('-password').exec()).filter(user => user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.SCHOOL_ADMIN);
    }

    async findUsersBySchool(schoolId: string): Promise<User[]> {
        // This method will be used when we have school association in user schema
        // Return users with roles that school admins can manage (staff only, not students)
        return await this.userModel.find({
            role: { $in: [UserRole.TEACHER, UserRole.LIBRARIAN, UserRole.ACCOUNTANT] }
        }).select('-password').exec();
    }

    async findUsersBySchoolAdmin(schoolAdminId: string): Promise<User[]> {
        try {
            // First, let's check if the user exists and is a school admin
            const adminUser = await this.userModel.findById(schoolAdminId).exec();
            if (!adminUser) {
                throw new BadRequestException('Admin user not found');
            }
            
            if (adminUser.role !== UserRole.SCHOOL_ADMIN) {
                throw new BadRequestException('User is not a school admin');
            }

            // Find the school managed by this admin
            // Try different query approaches due to potential schema mismatch
            let school = await this.schoolModel.findOne({ 
                schoolAdmin: new Types.ObjectId(schoolAdminId) 
            }).exec();
            
            // If not found, try alternative query (in case schoolAdmin is stored differently)
            if (!school) {
                school = await this.schoolModel.findOne({ 
                    schoolAdmin: schoolAdminId 
                }).exec();
            }
            
            // If still not found, try to find any school (for development/testing)
            if (!school) {
                console.log(`No school found for admin ${schoolAdminId}. Available schools:`);
                const allSchools = await this.schoolModel.find().exec();
                console.log('All schools:', allSchools.map(s => ({ id: s._id, name: s.schoolName, admin: s.schoolAdmin })));
                
                // Check if there are any schools at all
                if (allSchools.length === 0) {
                    console.log('No schools exist in the database');
                    return [];
                }
                
                            // Check if there's a school without an admin (orphaned school)
            const orphanedSchool = allSchools.find(s => !s.schoolAdmin);
            if (orphanedSchool) {
                console.log(`Found orphaned school: ${orphanedSchool.schoolName}, assigning admin ${schoolAdminId}`);
                // Assign this admin to the orphaned school
                await this.schoolModel.findByIdAndUpdate(orphanedSchool._id, {
                    schoolAdmin: new Types.ObjectId(schoolAdminId)
                }).exec();
                school = orphanedSchool;
            } else {
                console.log('All schools have admins, but none match the current admin');
                throw new BadRequestException('School not found for this admin. Please ensure the school admin has a school assigned.');
            }
            }

            console.log(`Found school: ${school?.schoolName} for admin: ${schoolAdminId}`);

            // Return users with roles that school admins can manage (staff only, not students)
            const users = await this.userModel.find({
                role: { $in: [UserRole.TEACHER, UserRole.LIBRARIAN, UserRole.ACCOUNTANT] }
            }).select('-password').exec();
            
            console.log(`Found ${users.length} staff users`);
            return users;
            
        } catch (error) {
            console.error('Error in findUsersBySchoolAdmin:', error);
            throw error;
        }
    }



    async deleteUser(userId: string, requesterId: string): Promise<{ message: string }> {
        try {
            // Check if the user exists
            const userToDelete = await this.userModel.findById(userId).exec();
            if (!userToDelete) {
                throw new BadRequestException('User not found');
            }

            // Check if the requester is authorized to delete this user
            const requester = await this.userModel.findById(requesterId).exec();
            if (!requester) {
                throw new BadRequestException('Requester not found');
            }

            // Only SYSTEM_ADMIN can delete any user
            // SCHOOL_ADMIN can only delete users from their school
            if (requester.role === UserRole.SYSTEM_ADMIN) {
                // System admin can delete any user
            } else if (requester.role === UserRole.SCHOOL_ADMIN) {
                // For school admins, we need to find their school first
                const adminSchool = await this.schoolModel.findOne({ 
                    schoolAdmin: new Types.ObjectId(requesterId) 
                }).exec();
                
                if (!adminSchool) {
                    throw new BadRequestException('School not found for this admin');
                }
                
                // Check if the user to delete belongs to the admin's school
                if (userToDelete.school && userToDelete.school.toString() !== adminSchool._id.toString()) {
                    throw new BadRequestException('You can only delete users from your own school');
                }
                
                // If user doesn't have a school field, they might be a new user or have a different structure
                // For now, allow deletion if admin has a school (this can be refined later)
            } else {
                throw new BadRequestException('You are not authorized to delete users');
            }

            // Prevent deletion of SYSTEM_ADMIN users (unless by another SYSTEM_ADMIN)
            if (userToDelete.role === UserRole.SYSTEM_ADMIN && requester.role !== UserRole.SYSTEM_ADMIN) {
                throw new BadRequestException('Only system admins can delete system admin users');
            }

            // Prevent school admin from deleting themselves
            if (userId === requesterId && requester.role === UserRole.SCHOOL_ADMIN) {
                throw new BadRequestException('You cannot delete your own account');
            }

            // Additional safety check: School admins can only delete staff members (not other school admins)
            if (requester.role === UserRole.SCHOOL_ADMIN) {
                if (userToDelete.role === UserRole.SCHOOL_ADMIN) {
                    throw new BadRequestException('School admins cannot delete other school admin accounts');
                }
                
                // Log the deletion for audit purposes
                console.log(`School admin ${requester.username} (${requester._id}) is deleting user ${userToDelete.username} (${userToDelete._id}) with role ${userToDelete.role} from school ${userToDelete.school}`);
            }

            // Delete the user
            const deletedUser = await this.userModel.findByIdAndDelete(userId).exec();
            if (!deletedUser) {
                throw new BadRequestException('Failed to delete user');
            }

            return { message: 'User deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    async getDeletableStaffForSchoolAdmin(schoolAdminId: string): Promise<User[]> {
        try {
            // Find the school managed by this admin
            const school = await this.schoolModel.findOne({ 
                schoolAdmin: new Types.ObjectId(schoolAdminId) 
            }).exec();
            
            if (!school) {
                throw new BadRequestException('School not found for this admin');
            }

            // Return only staff members that can be deleted (excluding school admins and students)
            const deletableStaff = await this.userModel.find({
                school: school._id,
                role: { 
                    $in: [UserRole.TEACHER, UserRole.LIBRARIAN, UserRole.ACCOUNTANT] 
                }
            }).select('-password').exec();

            return deletableStaff;
        } catch (error) {
            throw error;
        }
    }

    async getUserById(userId: string, requesterId: string): Promise<User> {
        try {
            // Check if the user exists
            const user = await this.userModel.findById(userId).select('-password').exec();
            if (!user) {
                throw new BadRequestException('User not found');
            }

            // Check if the requester is authorized to view this user
            const requester = await this.userModel.findById(requesterId).exec();
            if (!requester) {
                throw new BadRequestException('Requester not found');
            }

            // SYSTEM_ADMIN can view any user
            if (requester.role === UserRole.SYSTEM_ADMIN) {
                return user;
            }

            // SCHOOL_ADMIN can only view users from their school
            if (requester.role === UserRole.SCHOOL_ADMIN) {
                // For school admins, we need to find their school first
                const adminSchool = await this.schoolModel.findOne({ 
                    schoolAdmin: new Types.ObjectId(requesterId) 
                }).exec();
                
                if (!adminSchool) {
                    throw new BadRequestException('School not found for this admin');
                }
                
                // Check if the user belongs to the admin's school
                if (user.school && user.school.toString() !== adminSchool._id.toString()) {
                    throw new BadRequestException('You can only view users from your own school');
                }
                
                return user;
            }

            throw new BadRequestException('You are not authorized to view users');
        } catch (error) {
            throw error;
        }
    }

    async updateUser(userId: string, updateData: any, requesterId: string): Promise<User> {
        try {
            // Check if the user exists
            const userToUpdate = await this.userModel.findById(userId).exec();
            if (!userToUpdate) {
                throw new BadRequestException('User not found');
            }

            // Check if the requester is authorized to update this user
            const requester = await this.userModel.findById(requesterId).exec();
            if (!requester) {
                throw new BadRequestException('Requester not found');
            }

            // SYSTEM_ADMIN can update any user
            if (requester.role === UserRole.SYSTEM_ADMIN) {
                // System admin can update any user
            } else if (requester.role === UserRole.SCHOOL_ADMIN) {
                // For school admins, we need to find their school first
                const adminSchool = await this.schoolModel.findOne({ 
                    schoolAdmin: new Types.ObjectId(requesterId) 
                }).exec();
                
                if (!adminSchool) {
                    throw new BadRequestException('School not found for this admin');
                }
                
                // Check if the user to update belongs to the admin's school
                if (userToUpdate.school && userToUpdate.school.toString() !== adminSchool._id.toString()) {
                    throw new BadRequestException('You can only update users from your own school');
                }
            } else {
                throw new BadRequestException('You are not authorized to update users');
            }

            // Prevent updating SYSTEM_ADMIN users (unless by another SYSTEM_ADMIN)
            if (userToUpdate.role === UserRole.SYSTEM_ADMIN && requester.role !== UserRole.SYSTEM_ADMIN) {
                throw new BadRequestException('Only system admins can update system admin users');
            }

            // Hash password if it's being updated
            if (updateData.password) {
                updateData.password = await this.hashUtils.hashPassword(updateData.password);
            }

            // Update the user
            const updatedUser = await this.userModel.findByIdAndUpdate(
                userId, 
                updateData, 
                { new: true, runValidators: true }
            ).select('-password').exec();

            if (!updatedUser) {
                throw new BadRequestException('Failed to update user');
            }

            return updatedUser;
        } catch (error) {
            throw error;
        }
    }
}
