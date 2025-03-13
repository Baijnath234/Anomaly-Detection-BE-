import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class ForgotPasswordService {
    private usersRepository;
    private otpStorage;
    constructor(usersRepository: Repository<User>);
    private generateOtp;
    sendEmail(to: string, otp: string): Promise<void>;
    sendOTP(email: string): Promise<{
        message: string;
    }>;
    verifyOTP(email: string, otp: string): Promise<{
        message: string;
    }>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
}
