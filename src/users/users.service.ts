import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(userInfo: CreateUserDto) {
    const user = this.repo.create(userInfo);
    return this.repo.save(user);
  }

  findOne(id: number) {
    if (id === null || id === undefined) return null;
    return this.repo.findOneBy({ id });
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  async update(userData: UpdateUserDto) {
    const user = await this.findOne(userData.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    delete userData.id;
    Object.assign(user, userData);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.repo.remove(user);
  }
}
