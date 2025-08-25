import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../enums/user-role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockExecutionContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn(),
    })),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should allow access when user has required role', () => {
      const requiredRoles = [UserRole.ADMIN, UserRole.EDITOR];
      const mockUser = { role: UserRole.ADMIN };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: mockUser }),
      } as any);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of the required roles', () => {
      const requiredRoles = [UserRole.ADMIN, UserRole.EDITOR];
      const mockUser = { role: UserRole.EDITOR };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: mockUser }),
      } as any);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      const requiredRoles = [UserRole.ADMIN, UserRole.EDITOR];
      const mockUser = { role: UserRole.VIEWER };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: mockUser }),
      } as any);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'You do not have permission to access this resource',
      );
    });

    it('should throw ForbiddenException when user role is undefined', () => {
      const requiredRoles = [UserRole.ADMIN, UserRole.EDITOR];
      const mockUser = { role: undefined };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: mockUser }),
      } as any);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when user is undefined', () => {
      const requiredRoles = [UserRole.ADMIN, UserRole.EDITOR];

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      } as any);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should handle single required role', () => {
      const requiredRoles = [UserRole.ADMIN];
      const mockUser = { role: UserRole.ADMIN };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: mockUser }),
      } as any);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle empty roles array', () => {
      const requiredRoles: UserRole[] = [];

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
      jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { role: UserRole.VIEWER } }),
      } as any);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });
  });
});
