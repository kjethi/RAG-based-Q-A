import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { getUserQueryDto } from './dto/get-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService : ConfigService
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.usersRepository.create({
      ...registerDto,
      role: registerDto.role || UserRole.VIEWER,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(
    filter?: getUserQueryDto,
  ): Promise<{ users: User[]; meta: { totalRecords: number } }> {
    let where: FindOptionsWhere<User>[] = [];
    if (filter?.search) {
      where.push(
        { name: Like(`%${filter.search}%`) },
        { email: Like(`%${filter.search}%`) },
      );
    }
    if (filter?.role) {
      if (where.length > 0) {
        where = where.map((condition) => ({ ...condition, role: filter.role }));
      } else {
        where.push({ role: filter.role });
      }
    }
    const [users, totalRecords] = await this.usersRepository.findAndCount({
      where: where,
      skip: filter?.offset ?? 0,
      take: filter?.limit ?? this.configService.get("common.pagination.defaultRecord"),
      order: { createdAt: 'desc' },
    });

    return { users, meta: { totalRecords } };
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  async changeStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = isActive;
    return this.usersRepository.save(user);
  }
}
