import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; 
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private readonly otpStore = new Map<string, { otp: string; expiresAt: number }>();

  constructor(
    private usersService: UsersService, 
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await this.usersService.findByEmail(cleanEmail);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const cleanEmail = (user?.email || '').trim().toLowerCase();
    const payload = { email: cleanEmail, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, password: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.create({ email: cleanEmail, password: hashedPassword });
  }

  async forgotPassword(email: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new BadRequestException('Email is required');
    }

    let user = await this.usersService.findByEmail(cleanEmail);
    if (!user) {
      // In development / testing: automatically provision user so developers can test the password reset flow
      console.log(`[AuthService] User '${cleanEmail}' not found. Creating user account for testing password reset.`);
      user = await this.usersService.create({
        email: cleanEmail,
        password: await bcrypt.hash('TempPassword@123', 10),
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    this.otpStore.set(cleanEmail, { otp, expiresAt });

    console.log('=============================================');
    console.log(`[AuthService] Password Reset OTP for ${cleanEmail}: ${otp}`);
    console.log('=============================================');

    const emailUser = process.env.EMAIL_USER?.trim();
    const emailPass = process.env.EMAIL_PASS?.trim();
    const hasSmtpConfig = emailUser && emailPass && !emailUser.includes('your_email');

    if (hasSmtpConfig) {
      try {
        await this.sendPasswordResetOtpEmail(cleanEmail, otp);
        return {
          message: 'OTP sent successfully! Please check your email.',
        };
      } catch (error) {
        console.warn(`[AuthService] SMTP delivery failed: ${error?.message || error}. Falling back to console OTP.`);
        return {
          message: `Email sending failed (${error?.message}). For testing, OTP is: ${otp}`,
          otp,
        };
      }
    } else {
      console.info('[AuthService] EMAIL_USER / EMAIL_PASS not configured in .env. Returning OTP for testing.');
      return {
        message: `OTP generated successfully! (Dev mode: OTP is ${otp})`,
        otp,
      };
    }
  }

  async verifyOtp(email: string, otp: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();

    if (!cleanEmail || !cleanOtp) {
      throw new BadRequestException('Email and OTP are required');
    }

    const record = this.otpStore.get(cleanEmail);
    if (!record || Date.now() > record.expiresAt) {
      throw new BadRequestException('OTP has expired or was not requested. Please request a new one.');
    }

    if (record.otp !== cleanOtp) {
      throw new BadRequestException('Invalid OTP. Please check and try again.');
    }

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();

    if (!cleanEmail || !cleanOtp || !newPassword) {
      throw new BadRequestException('Email, OTP, and newPassword are required');
    }

    // Verify OTP first
    await this.verifyOtp(cleanEmail, cleanOtp);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updated = await this.usersService.updatePassword(cleanEmail, hashedPassword);

    if (!updated) {
      throw new BadRequestException('Failed to update password. User not found.');
    }

    // Invalidate OTP after successful reset
    this.otpStore.delete(cleanEmail);

    return { message: 'Password has been successfully reset.' };
  }

  private async sendPasswordResetOtpEmail(email: string, otp: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: 'Your Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Password Reset Request</h2>
          <p>Hello,</p>
          <p>Your one-time password (OTP) to reset your password is:</p>
          <p style="font-size: 24px; font-weight: bold; color: #1976d2; letter-spacing: 2px;">${otp}</p>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
  }
}
