import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting database seeding...');
    
    try {
      await this.seedAdminUsers();
      this.logger.log('✅ Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  private async seedAdminUsers() {
    this.logger.log('👥 Seeding admin users...');

    // Check if admin users already exist
    const existingAdmin = await this.userRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (existingAdmin) {
      this.logger.log('ℹ️ Admin users already exist, skipping...');
      return;
    }

    // Default admin user
    const defaultAdmin = {
      email: this.configService.get('common.admin.defaultEmail'),
      password: this.configService.get('common.admin.defaultPassword'),
      name: this.configService.get('common.admin.defaultName'),
      role: UserRole.ADMIN,
      isActive: true,
    };

    // Create admin user
    const adminUser = this.userRepository.create(defaultAdmin);
    await this.userRepository.save(adminUser);

    this.logger.log(`✅ Created admin user: ${adminUser.email}`);

    // Create additional default users if configured
    await this.createDefaultUsers();
  }

  private async createDefaultUsers() {
    const defaultUsers = [
      {
        email: this.configService.get('common.admin.defaultEditorEmail'),
        password: this.configService.get('common.admin.defaultEditorPassword'),
        name: 'Default Editor',
        role: UserRole.EDITOR,
        isActive: true,
      },
      {
        email: this.configService.get('common.admin.defaultViewerEmail'),
        password: this.configService.get('common.admin.defaultViewerPassword'),
        name: 'Default Viewer',
        role: UserRole.VIEWER,
        isActive: true,
      },
    ];

    for (const userData of defaultUsers) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const user = this.userRepository.create(userData);
        await this.userRepository.save(user);
        this.logger.log(`✅ Created default user: ${user.email}`);
      }
    }
  }
}
