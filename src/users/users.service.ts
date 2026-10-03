import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly users: Array<{ id: number; email: string; password: string }> = [];

  create(data: { email: string; password: string }) {
    const user = {
      id: Date.now(),
      email: data.email,
      password: data.password,
    };
    this.users.push(user);
    return user;
  }

  findByEmail(email: string) {
    return this.users.find((user) => user.email === email) || null;
  }
}
