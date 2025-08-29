import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../../schemas/user.schema'
import { CreateUserDto } from './dto/create-user.dto';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { CreateLibrarianDto } from './dto/create-librarian.dto';
import { CreateAccountantDto } from './dto/create-accountant.dto';
import { HashService } from 'src/utils/utils.service';
import { CreateStudentDto } from '../students/dto/create-student.dto';
import { MailService } from '../mail/mail.service';
import { School } from '../../schemas/school.schema';
import { Librarian } from '../../schemas/librarian.schema';
import { Accountant } from '../../schemas/accountant.schema';
import { ErrorHandlerUtil } from '../../utils/error-handler.util';
@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(School.name) private schoolModel: Model<School>,
        @InjectModel(Librarian.name) private librarianModel: Model<Librarian>,
        @InjectModel(Accountant.name) private accountantModel: Model<Accountant>,
        private hashUtils: HashService,
        private mailService: MailService
    ) {}
    
    async addSchoolAdmin(userData: CreateUserDto): Promise<User> {
        try {
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
            return await newUser.save();
        } catch (error) {
            // Use the error handler utility for consistent error handling
            ErrorHandlerUtil.handleMongoError(error);
        }
    }

    async addLibrarian(librarianData: CreateLibrarianDto, schoolAdminId: string, file?: Express.Multer.File): Promise<{ newLibrarian: Librarian; librarianPassword: string }> {
        try {
            // Get the admin user and their school
            const adminUser = await this.userModel.findById(schoolAdminId);
            if (!adminUser) {
                throw new BadRequestException('User not found');
            }

            if (!adminUser.school) {
                throw new BadRequestException('User is not associated with any school');
            }

            // Get school details
            const school = await this.schoolModel.findById(adminUser.school);
            if (!school) {
                throw new BadRequestException('School not found');
            }

            // Check if librarian already exists
            const existingLibrarian = await this.librarianModel.findOne({
                firstName: librarianData.firstName,
                lastName: librarianData.lastName,
            });
            if (existingLibrarian) throw new BadRequestException('Librarian already exists');

            // Check if user account already exists
            const existingUser = await this.userModel.findOne({
                $or: [
                    { email: librarianData.email },
                    { phoneNumber: librarianData.phoneNumber }
                ]
            });
            
            if (existingUser) throw new BadRequestException('Phone number or account is already in use');

            // Generate credentials
            const password = this.hashUtils.generatePassword(librarianData.firstName);
            const hashedPassword = await this.hashUtils.hashPassword(password);
            
            const user = new this.userModel({
                username: this.hashUtils.generateUsernameForTeacher(
                    librarianData.firstName,
                    librarianData.lastName,
                ),
                email: librarianData.email,
                phoneNumber: librarianData.phoneNumber,
                password: hashedPassword,
                role: UserRole.LIBRARIAN,
                school: school._id,
            });
            await user.save();

            // Handle profile picture upload if provided
            if (file) {
                const uploadedFile = await this.hashUtils.uploadFileToCloudinary(file);
                librarianData.profilePicture = uploadedFile.url;
            }

            // Create librarian record
            const createdLibrarian = new this.librarianModel({
                ...librarianData,
                school: school._id,
                accountCredentials: user._id,
            });
            
            const newLibrarian = await createdLibrarian.save();
            
            // Send account info email
            await this.mailService.sendAccountInfoEmail(
                user.email, 
                user.username, 
                password, 
                UserRole.LIBRARIAN
            );
            
            return {
                newLibrarian: await newLibrarian.populate('school'),
                librarianPassword: password,
            };
        } catch (error) {
            // Use the error handler utility for consistent error handling
            ErrorHandlerUtil.handleMongoError(error);
        }
    }

    async addAccountant(accountantData: CreateAccountantDto, schoolAdminId: string, file?: Express.Multer.File): Promise<{ newAccountant: Accountant; accountantPassword: string }> {
        try {
            // Get the admin user and their school
            const adminUser = await this.userModel.findById(schoolAdminId);
            if (!adminUser) {
                throw new BadRequestException('User not found');
            }

            if (!adminUser.school) {
                throw new BadRequestException('User is not associated with any school');
            }

            // Get school details
            const school = await this.schoolModel.findById(adminUser.school);
            if (!school) {
                throw new BadRequestException('School not found');
            }

            // Check if accountant already exists
            const existingAccountant = await this.accountantModel.findOne({
                firstName: accountantData.firstName,
                lastName: accountantData.lastName,
            });
            if (existingAccountant) throw new BadRequestException('Accountant already exists');

            // Check if user account already exists
            const existingUser = await this.userModel.findOne({
                $or: [
                    { email: accountantData.email },
                    { phoneNumber: accountantData.phoneNumber }
                ]
            });
            
            if (existingUser) throw new BadRequestException('Phone number or account is already in use');

            // Generate credentials
            const password = this.hashUtils.generatePassword(accountantData.firstName);
            const hashedPassword = await this.hashUtils.hashPassword(password);
            
            const user = new this.userModel({
                username: this.hashUtils.generateUsernameForTeacher(
                    accountantData.firstName,
                    accountantData.lastName,
                ),
                email: accountantData.email,
                phoneNumber: accountantData.phoneNumber,
                password: hashedPassword,
                role: UserRole.ACCOUNTANT,
                school: school._id,
            });
            await user.save();

            // Handle profile picture upload if provided
            if (file) {
                const uploadedFile = await this.hashUtils.uploadFileToCloudinary(file);
                accountantData.profilePicture = uploadedFile.url;
            }

            // Create accountant record
            const createdAccountant = new this.accountantModel({
                ...accountantData,
                school: school._id,
                accountCredentials: user._id,
            });
            
            const newAccountant = await createdAccountant.save();
            
            // Send account info email
            await this.mailService.sendAccountInfoEmail(
                user.email, 
                user.username, 
                password, 
                UserRole.ACCOUNTANT
            );
            
            return {
                newAccountant: await newAccountant.populate('school'),
                accountantPassword: password,
            };
        } catch (error) {
            // Use the error handler utility for consistent error handling
            ErrorHandlerUtil.handleMongoError(error);
        }
    }


      
    
    async findUserByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).select('-password').exec();
    }
    
    async findAllUsers(): Promise<User[]> {
        return (await this.userModel.find().select('-password').exec()).filter(user => user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.SCHOOL_ADMIN);
    }

    

    async findUsersBySchool(schoolId: string): Promise<User[]> {
        try {
            // Validate schoolId
            if (!Types.ObjectId.isValid(schoolId)) {
                throw new BadRequestException('Invalid school ID');
            }

            // Find all users that belong to the specified school
            // Exclude system-admin users and include only staff roles
            const users = await this.userModel.find({
                school: new Types.ObjectId(schoolId),
                role: { $in: [UserRole.TEACHER, UserRole.LIBRARIAN, UserRole.ACCOUNTANT, UserRole.SCHOOL_ADMIN] }
            }).select('-password').exec();
            
            console.log(`Found ${users.length} users for school ${schoolId}`);
            return users;
            
        } catch (error) {
            console.error('Error in findUsersBySchool:', error);
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

    async getDeletableStaffForSchoolAdmin(schoolId: string): Promise<User[]> {
        try {
            // Validate schoolId
            if (!Types.ObjectId.isValid(schoolId)) {
                throw new BadRequestException('Invalid school ID');
            }

            // Return only staff members that can be deleted (excluding school admins and students)
            const deletableStaff = await this.userModel.find({
                school: new Types.ObjectId(schoolId),
                role: { 
                    $in: [UserRole.TEACHER, UserRole.LIBRARIAN, UserRole.ACCOUNTANT] 
                }
            }).select('-password').exec();

            console.log(`Found ${deletableStaff.length} deletable staff members for school ${schoolId}`);
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
