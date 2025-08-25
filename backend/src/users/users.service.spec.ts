import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { getUserQueryDto } from './dto/get-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let configService: ConfigService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    role: UserRole.VIEWER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: UserRole.ADMIN,
      };

      const newUser = { ...mockUser, ...registerDto };
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.create(registerDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        role: registerDto.role,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });

    it('should create user with default role when not provided', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      const newUser = { ...mockUser, ...registerDto, role: UserRole.VIEWER };
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.create(registerDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        role: UserRole.VIEWER,
      });
      expect(result).toEqual(newUser);
    });

    it('should throw ConflictException when user with email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(registerDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by id', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('999');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '999' } });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users with default pagination', async () => {
      const users = [mockUser];
      const totalRecords = 1;
      const defaultLimit = 10;

      mockConfigService.get.mockReturnValue(defaultLimit);
      mockRepository.findAndCount.mockResolvedValue([users, totalRecords]);

      const result = await service.findAll();

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [],
        skip: 0,
        take: defaultLimit,
        order: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        users,
        meta: { totalRecords },
      });
    });

    it('should return users with custom pagination', async () => {
      const users = [mockUser];
      const totalRecords = 1;
      const filter: getUserQueryDto = {
        offset: 5,
        limit: 20,
      };

      mockRepository.findAndCount.mockResolvedValue([users, totalRecords]);

      const result = await service.findAll(filter);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [],
        skip: 5,
        take: 20,
        order: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        users,
        meta: { totalRecords },
      });
    });

    it('should apply search filter correctly', async () => {
      const users = [mockUser];
      const totalRecords = 1;
      const filter: getUserQueryDto = {
        search: 'test',
      };

      mockConfigService.get.mockReturnValue(10);
      mockRepository.findAndCount.mockResolvedValue([users, totalRecords]);

      const result = await service.findAll(filter);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [
          { name: Like('%test%') },
          { email: Like('%test%') },
        ],
        skip: 0,
        take: 10,
        order: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        users,
        meta: { totalRecords },
      });
    });

    it('should apply role filter correctly', async () => {
      const users = [mockUser];
      const totalRecords = 1;
      const filter: getUserQueryDto = {
        role: UserRole.ADMIN,
      };

      mockConfigService.get.mockReturnValue(10);
      mockRepository.findAndCount.mockResolvedValue([users, totalRecords]);

      const result = await service.findAll(filter);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [{ role: UserRole.ADMIN }],
        skip: 0,
        take: 10,
        order: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        users,
        meta: { totalRecords },
      });
    });

    it('should apply both search and role filters correctly', async () => {
      const users = [mockUser];
      const totalRecords = 1;
      const filter: getUserQueryDto = {
        search: 'test',
        role: UserRole.ADMIN,
      };

      mockConfigService.get.mockReturnValue(10);
      mockRepository.findAndCount.mockResolvedValue([users, totalRecords]);

      const result = await service.findAll(filter);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [
          { name: Like('%test%'), role: UserRole.ADMIN },
          { email: Like('%test%'), role: UserRole.ADMIN },
        ],
        skip: 0,
        take: 10,
        order: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        users,
        meta: { totalRecords },
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateData);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const updateData = { name: 'Updated Name' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', updateData)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '999' } });
    });
  });

  describe('changeStatus', () => {
    it('should change user status successfully', async () => {
      const updatedUser = { ...mockUser, isActive: false };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.changeStatus('1', false);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.changeStatus('999', false)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '999' } });
    });
  });
});
