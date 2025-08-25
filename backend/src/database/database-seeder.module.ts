import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { SeederService } from './seeder.service';

@Module({
  imports: [DatabaseModule],
})
export class DatabaseSeederModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederModule.name);
  private readonly maxRetries = 5;
  private readonly retryDelay = 3000; // 3 seconds

  constructor(private readonly seederService: SeederService) {}

  async onModuleInit() {
    this.logger.log('🚀 Initializing database seeder...');
    
    // Wait for database connection to be established
    await this.waitForDatabase();
    
    try {
      await this.seederService.seed();
    } catch (error) {
      this.logger.error('❌ Failed to seed database:', error);
      // Don't throw error to prevent app from crashing
      // You might want to handle this differently in production
    }
  }

  private async waitForDatabase(): Promise<void> {
    let retries = 0;
    
    while (retries < this.maxRetries) {
      try {
        this.logger.log(`🔄 Attempting to connect to database (attempt ${retries + 1}/${this.maxRetries})...`);
        
        // Wait for the delay
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        
        // Try to seed (this will fail if DB is not ready)
        await this.seederService.seed();
        
        this.logger.log('✅ Database connection established successfully!');
        return;
      } catch (error) {
        retries++;
        this.logger.warn(`⚠️ Database connection attempt ${retries} failed: ${error.message}`);
        
        if (retries >= this.maxRetries) {
          this.logger.error(`❌ Failed to connect to database after ${this.maxRetries} attempts`);
          throw new Error('Database connection timeout');
        }
      }
    }
  }
}
