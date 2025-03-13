import { UsersService } from './users.service';
import { ForgotPasswordService } from './forgot-password.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
export declare class UsersController {
    private readonly usersService;
    private readonly forgotPasswordService;
    constructor(usersService: UsersService, forgotPasswordService: ForgotPasswordService);
    register(createUserDto: CreateUserDto): Promise<User>;
    signIn(signInDto: {
        email: string;
        password: string;
    }): Promise<{
        message: string;
        user: User;
    }>;
}
