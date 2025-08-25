import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    role: UserRole.VIEWER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    validatePassword: jest.fn(),
    hashPassword: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a user and return user with token', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: UserRole.VIEWER,
      };

      const mockToken = 'jwt-token';
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.register(registerDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(result).toEqual({
        user: mockUser,
        token: mockToken,
      });
    });
  });

  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockToken = 'jwt-token';
      mockUser.validatePassword.mockResolvedValue(true);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginDto.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(result).toEqual({
        user: mockUser,
        token: mockToken,
      });
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginDto.password);
    });

    it('should throw BadRequestException when user not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUser.validatePassword).toHaveBeenCalledWith('password123');
      expect(result).toBe(mockUser);
    });

    it('should return null for invalid password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUser.validatePassword).toHaveBeenCalledWith('wrongpassword');
      expect(result).toBeNull();
    });

    it('should return null when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('generateToken', () => {
    it('should generate token with correct payload', () => {
      const mockToken = 'jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service['generateToken'](mockUser);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(result).toBe(mockToken);
    });
  });
});
