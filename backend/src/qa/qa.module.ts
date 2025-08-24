import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QaController } from './qa.controller';
import { QaService } from './qa.service';

@Module({
  imports: [ConfigModule],
  controllers: [QaController],
  providers: [QaService],
  exports: [QaService],
})
export class QaModule {}
