import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
      };

      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'John',
        role: UserRole.VIEWER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      };

      jest.spyOn(service, 'register').mockResolvedValue({
        user: mockUser,
        token: 'jwt-token',
      });

      await controller.register(registerDto);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        name: '',
        role: UserRole.VIEWER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      } as User;

      jest.spyOn(service, 'login').mockResolvedValue({
        user: mockUser,
        token: 'jwt-token',
      });

      await controller.login(loginDto);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
