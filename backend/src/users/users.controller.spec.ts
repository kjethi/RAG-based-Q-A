import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { StatusUpdateUserDto } from './dto/status-update-user.dto';
import { getUserQueryDto } from './dto/get-user.dto';
import { UserRole } from '../common/enums/user-role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.VIEWER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findAll: jest.fn(),
    update: jest.fn(),
    changeStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users without filters', async () => {
      const expectedResponse = {
        users: [mockUser],
        meta: { totalRecords: 1 },
      };

      mockUsersService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(expectedResponse);
    });

    it('should return users with search filter', async () => {
      const filterQuery: getUserQueryDto = {
        search: 'test',
      };

      const expectedResponse = {
        users: [mockUser],
        meta: { totalRecords: 1 },
      };

      mockUsersService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(filterQuery);

      expect(usersService.findAll).toHaveBeenCalledWith(filterQuery);
      expect(result).toEqual(expectedResponse);
    });

    it('should return users with role filter', async () => {
      const filterQuery: getUserQueryDto = {
        role: UserRole.ADMIN,
      };

      const expectedResponse = {
        users: [mockUser],
        meta: { totalRecords: 1 },
      };

      mockUsersService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(filterQuery);

      expect(usersService.findAll).toHaveBeenCalledWith(filterQuery);
      expect(result).toEqual(expectedResponse);
    });

    it('should return users with pagination filters', async () => {
      const filterQuery: getUserQueryDto = {
        offset: 5,
        limit: 20,
      };

      const expectedResponse = {
        users: [mockUser],
        meta: { totalRecords: 1 },
      };

      mockUsersService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(filterQuery);

      expect(usersService.findAll).toHaveBeenCalledWith(filterQuery);
      expect(result).toEqual(expectedResponse);
    });

    it('should return users with combined filters', async () => {
      const filterQuery: getUserQueryDto = {
        search: 'test',
        role: UserRole.VIEWER,
        offset: 0,
        limit: 10,
      };

      const expectedResponse = {
        users: [mockUser],
        meta: { totalRecords: 1 },
      };

      mockUsersService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(filterQuery);

      expect(usersService.findAll).toHaveBeenCalledWith(filterQuery);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual({
        message: 'User updated successfully',
        user: updatedUser,
      });
    });

    it('should handle user update with partial data', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual({
        message: 'User updated successfully',
        user: updatedUser,
      });
    });
  });

  describe('deactivate', () => {
    it('should deactivate user successfully', async () => {
      const params: StatusUpdateUserDto = {
        id: '1',
        status: 'deactivate' as any,
      };

      mockUsersService.changeStatus.mockResolvedValue({ ...mockUser, isActive: false });

      const result = await controller.deactivate(params);

      expect(usersService.changeStatus).toHaveBeenCalledWith('1', false);
      expect(result).toEqual({
        message: 'User status changed successfully',
        userId: '1',
        isActive: false,
      });
    });

    it('should activate user when status is not deactivate', async () => {
      const params: StatusUpdateUserDto = {
        id: '1',
        status: 'activate' as any,
      };

      mockUsersService.changeStatus.mockResolvedValue({ ...mockUser, isActive: true });

      const result = await controller.deactivate(params);

      expect(usersService.changeStatus).toHaveBeenCalledWith('1', true);
      expect(result).toEqual({
        message: 'User status changed successfully',
        userId: '1',
        isActive: true,
      });
    });

    it('should handle status change with different status values', async () => {
      const params: StatusUpdateUserDto = {
        id: '1',
        status: 'activate' as any,
      };

      mockUsersService.changeStatus.mockResolvedValue({ ...mockUser, isActive: true });

      const result = await controller.deactivate(params);

      expect(usersService.changeStatus).toHaveBeenCalledWith('1', true);
      expect(result).toEqual({
        message: 'User status changed successfully',
        userId: '1',
        isActive: true,
      });
    });
  });
});
