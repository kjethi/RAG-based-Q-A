import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SeederService } from './seeder.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

describe('SeederService', () => {
  let service: SeederService;
  let mockUserRepository: any;
  let mockConfigService: any;

  const mockUser = {
    id: '1',
    email: 'admin@example.com',
    name: 'System Administrator',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SeederService>(SeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seed', () => {
    it('should seed admin users successfully', async () => {
      // Mock config values
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          'common.admin.defaultEmail': 'admin@example.com',
          'common.admin.defaultPassword': 'admin123',
          'common.admin.defaultName': 'System Administrator',
          'common.admin.defaultEditorEmail': 'editor@example.com',
          'common.admin.defaultEditorPassword': 'editor123',
          'common.admin.defaultViewerEmail': 'viewer@example.com',
          'common.admin.defaultViewerPassword': 'viewer123',
        };
        return config[key];
      });

      // Mock no existing admin
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.seed();

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { role: UserRole.ADMIN },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should skip seeding if admin already exists', async () => {
      // Mock existing admin
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await service.seed();

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { role: UserRole.ADMIN },
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle errors during seeding', async () => {
      mockConfigService.get.mockReturnValue('admin@example.com');
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.seed()).rejects.toThrow('Database error');
    });
  });

  describe('seedAdminUsers', () => {
    it('should create admin user with correct data', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          'common.admin.defaultEmail': 'admin@example.com',
          'common.admin.defaultPassword': 'admin123',
          'common.admin.defaultName': 'System Administrator',
        };
        return config[key];
      });

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service['seedAdminUsers']();

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'admin123',
        name: 'System Administrator',
        role: UserRole.ADMIN,
        isActive: true,
      });
    });
  });

  describe('createDefaultUsers', () => {
    it('should create default users if they do not exist', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          'common.admin.defaultEditorEmail': 'editor@example.com',
          'common.admin.defaultEditorPassword': 'editor123',
          'common.admin.defaultViewerEmail': 'viewer@example.com',
          'common.admin.defaultViewerPassword': 'viewer123',
        };
        return config[key];
      });

      // Mock no existing users
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service['createDefaultUsers']();

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.create).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should skip creating users that already exist', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          'common.admin.defaultEditorEmail': 'editor@example.com',
          'common.admin.defaultEditorPassword': 'editor123',
          'common.admin.defaultViewerEmail': 'viewer@example.com',
          'common.admin.defaultViewerPassword': 'viewer123',
        };
        return config[key];
      });

      // Mock existing users
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await service['createDefaultUsers']();

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
