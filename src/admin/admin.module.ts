import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TestModule } from '../test/test.module';
import { TestService } from '../test/test.service';
import { ReadingModule } from '../reading/reading.module';
import { ListeningModule } from '../listening/listening.module';
import { WritingModule } from '../writing/writing.module';
import { ReadingService } from '../reading/reading.service';
import { ListeningService } from '../listening/listening.service';
import { WritingService } from '../writing/writing.service';


@Module({
  imports: [TestModule, ReadingModule, ListeningModule, WritingModule],
  controllers: [AdminController],
  providers: [AdminService, TestService, ReadingService, ListeningService, WritingService],
})
export class AdminModule {}
