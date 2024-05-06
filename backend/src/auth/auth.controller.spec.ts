import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('signIn', () => {
  //   it('should return an access token', async () => {
  //     const signInDto = {
  //       email: 'wL4t1@example.com',
  //       password: 'password',
  //     };

  //     const result = await controller.signIn(signInDto);

  //     console.log(result);
  //   });
  // });
});
