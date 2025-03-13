// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from '../users/user.entity';
// import * as bcrypt from 'bcrypt';
// import { AuthService } from './auth.service';
// import * as crypto from 'crypto';
// import { ForgotPasswordDto } from '../users/dto/create-user.dto';  // Import the DTO
// import { ResetPasswordDto } from '../users/dto/create-user.dto';  // Import ResetPassword DTO
// import * as nodemailer from 'nodemailer';

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,
//   ) {}

//   // Generate reset token
//   private generateResetToken(): string {
//     return crypto.randomBytes(32).toString('hex');
//   }

//   // Forgot Password: Generate and send reset token
//   async forgotPassword(email: string): Promise<any> {
//     try {
//       const user = await this.usersRepository.findOne({ where: { email } });
//       if (!user) {
//         throw new Error('Email not found');
//       }
      
//       const resetToken = this.generateResetToken();
//       user.resetToken = resetToken;
//       user.resetTokenExpiresAt = new Date(Date.now() + 3600000); // Token expires in 1 hour
//       await this.usersRepository.save(user);
      
//       // Send reset email (implement email service here)
      
//       return { message: 'If this email exists, you will receive a password reset link shortly.' };
//     } catch (error) {
//       console.error(error);
//       throw new Error('Failed to process forgot password request');
//     }
//   }
  

//   // Reset Password: Update the password with the reset token
//   async resetPassword(token: string, newPassword: string): Promise<any> {
//     try {
//       const user = await this.usersRepository.findOne({ where: { resetToken: token } });
//       if (!user || user.resetTokenExpiresAt < new Date()) {
//         throw new Error('Invalid or expired token');
//       }
  
//       const hashedPassword = await bcrypt.hash(newPassword, 10);
//       user.password = hashedPassword;
//       user.resetToken = null; // Clear the reset token after successful reset
//       user.resetTokenExpiresAt = null; // Clear the expiration time
  
//       await this.usersRepository.save(user);
      
//       return { message: 'Password has been successfully reset.' };
//     } catch (error) {
//       console.error(error);
//       throw new Error('Failed to reset password');
//     }
//   }
  
// }

// auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service'; // Ensure correct import for AuthService

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto.email, registerDto.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: any) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }
}
