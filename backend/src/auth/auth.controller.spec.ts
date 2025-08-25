import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/enums/user-role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.VIEWER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: UserRole.VIEWER,
      };

      const expectedResponse = {
        user: mockUser,
        token: 'jwt-token',
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle registration with default role', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      const expectedResponse = {
        user: { ...mockUser, role: UserRole.VIEWER },
        token: 'jwt-token',
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        user: mockUser,
        token: 'jwt-token',
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getProfile', () => {
    it('should return user profile from request', () => {
      const mockRequest = {
        user: mockUser,
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual({ user: mockUser });
    });

    it('should handle request without user', () => {
      const mockRequest = {};

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual({ user: undefined });
    });
  });

  describe('adminOnly', () => {
    it('should return admin-only message', () => {
      const result = controller.adminOnly();

      expect(result).toEqual({
        message: 'This endpoint is only accessible to admins',
      });
    });
  });
});
