import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { SigninUserDto } from './dtos/signin-user.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async signup(userInfo: CreateUserDto) {
    const { email, password } = userInfo;
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email already in use');
    }

    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const result = `${salt}.${hash.toString('hex')}`;

    return this.usersService.create({ email, password: result });
  }

  async signin(userInfo: SigninUserDto) {
    const { email, password } = userInfo;
    const users = await this.usersService.find(email);

    if (!users.length) {
      throw new BadRequestException('Email or password are not valid');
    }

    const user = users[0];
    const [salt, hash] = user.password.split('.');

    const inputHash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash !== inputHash.toString('hex')) {
      throw new BadRequestException('Email or password are not valid');
    }
    return user;
  }
}
