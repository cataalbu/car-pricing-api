import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';
import { SigninUserDto } from './dtos/signin-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'test@test.com',
          password: 'pass',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'pass' } as User]);
      },
      // remove: (id: number) => {},
      // update: () => {},
    };

    fakeAuthService = {
      // signup: () => {},
      signin: ({ email, password }: SigninUserDto) => {
        return Promise.resolve({
          id: 1,
          email,
          password,
        } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('test@test.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@test.com');
  });

  it('findUser returns a user with id', async () => {
    const user = controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('throws exception for inexistent user', async () => {
    fakeUsersService.findOne = () => Promise.resolve(null);

    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signs in the user', async () => {
    const session = { userId: undefined };
    const user = await controller.signinUser(
      { email: 'test@test.com', password: 'test' },
      session,
    );
    expect(user).toBeDefined();
    expect(user.id).toBe(1);
    expect(session.userId).toBe(1);
  });
});
