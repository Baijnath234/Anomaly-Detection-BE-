import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { User } from './users/user.entity';

@Controller('users')
export class AppController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.usersService.create({
      email: createUserDto.email,
      password: hashedPassword,
    });
  }

  @Post('sign-in')
  async signIn(@Body() body: { email: string; password: string }) {
    const user = this.usersService.findByEmail(body.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(body.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      message: 'Sign-in successful',
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  getHello(): string {
    return 'Hello World!';
  }
}
