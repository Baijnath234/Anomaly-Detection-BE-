import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller(['auth', 'user'])
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
  async forgotPassword(@Body() body: any) {
    const email = body?.email || body?.contactInfo || '';
    return this.authService.forgotPassword(email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: any) {
    const email = body?.email || body?.contactInfo || '';
    const otp = body?.otp || '';
    return this.authService.verifyOtp(email, otp);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    const email = body?.email || body?.contactInfo || '';
    const otp = body?.otp || '';
    const newPassword = body?.newPassword || body?.password || '';
    return this.authService.resetPassword(email, otp, newPassword);
  }
}
