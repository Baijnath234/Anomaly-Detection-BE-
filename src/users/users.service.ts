import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  private readonly users: Array<{ id: number; email: string; password: string }> = [];

  constructor(
    @Optional()
    @InjectRepository(User)
    private readonly usersRepository?: Repository<User>,
  ) {}

  async create(data: { email: string; password: string }) {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const user = {
      id: Date.now(),
      email: cleanEmail,
      password: data.password,
    };
    this.users.push(user);

    if (this.usersRepository) {
      try {
        const dbUser = this.usersRepository.create({
          ...data,
          email: cleanEmail,
        });
        await this.usersRepository.save(dbUser);
      } catch (err) {
        console.warn('TypeORM save skipped/failed, using in-memory store:', err?.message || err);
      }
    }

    return user;
  }

  async findByEmail(email: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (this.usersRepository) {
      try {
        const dbUser = await this.usersRepository.findOne({
          where: [{ email: cleanEmail }, { email }]
        });
        if (dbUser) return dbUser;
      } catch (err) {
        console.warn('TypeORM find skipped/failed, checking in-memory store:', err?.message || err);
      }
    }

    return this.users.find((user) => user.email?.trim().toLowerCase() === cleanEmail) || null;
  }

  async updatePassword(email: string, newPasswordHash: string): Promise<boolean> {
    const cleanEmail = (email || '').trim().toLowerCase();
    let updated = false;

    const memoryUser = this.users.find((user) => user.email?.trim().toLowerCase() === cleanEmail);
    if (memoryUser) {
      memoryUser.password = newPasswordHash;
      updated = true;
    }

    if (this.usersRepository) {
      try {
        const dbUser = await this.usersRepository.findOne({
          where: [{ email: cleanEmail }, { email }]
        });
        if (dbUser) {
          dbUser.password = newPasswordHash;
          await this.usersRepository.save(dbUser);
          updated = true;
        }
      } catch (err) {
        console.warn('TypeORM update skipped/failed:', err?.message || err);
      }
    }

    return updated;
  }
}
