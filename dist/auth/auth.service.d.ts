import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    register(email: string, password: string): Promise<import("../users/user.entity").User>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    private sendPasswordResetEmail;
}
