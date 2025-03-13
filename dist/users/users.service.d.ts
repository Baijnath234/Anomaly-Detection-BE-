import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    private generateResetToken;
    createUser(createUserDto: CreateUserDto): Promise<User>;
    validateUser(email: string, password: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | undefined>;
    create(userData: any): Promise<User>;
    resetPassword(token: string, newPassword: string): Promise<User | null>;
}
