import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: any): Promise<{
        access_token: string;
    }>;
    register(registerDto: any): Promise<{
        id: number;
        email: string;
        password: string;
    }>;
    forgotPassword(forgotPasswordDto: any): Promise<{
        message: string;
    }>;
}
