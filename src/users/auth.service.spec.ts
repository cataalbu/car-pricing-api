import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (userInfo: CreateUserDto) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email: userInfo.email,
          password: userInfo.password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    // temporary DI Container
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    // Reach into it and get a copy of the AuthService
    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup({
      email: 'test@test.com',
      password: 'test',
    });
    expect(user.password).not.toEqual('test');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email in use', async () => {
    await service.signup({ email: 'test@test.com', password: 'asdf' });

    await expect(
      service.signup({ email: 'test@test.com', password: 'asdf' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws an error if signs in with inexistent email', async () => {
    await expect(
      service.signin({ email: 'test@test.com', password: 'asdf' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws an error if signs in with incorrect password', async () => {
    await service.signup({ email: 'test@test.com', password: 'pass' });
    await expect(
      service.signin({ email: 'test@test.com', password: 'pass1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns the user after successful signin', async () => {
    await service.signup({ email: 'test@test.com', password: 'test' });

    const user = await service.signin({
      email: 'test@test.com',
      password: 'test',
    });
    expect(user).toBeDefined();
  });
});
