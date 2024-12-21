import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TestModule } from 'src/test/test.module';
import { TestService } from 'src/test/test.service';
import { ReadingModule } from 'src/reading/reading.module';
import { ListeningModule } from 'src/listening/listening.module';
import { WritingModule } from 'src/writing/writing.module';
import { ReadingService } from 'src/reading/reading.service';
import { ListeningService } from 'src/listening/listening.service';
import { WritingService } from 'src/writing/writing.service';


@Module({
  imports: [TestModule, ReadingModule, ListeningModule, WritingModule],
  controllers: [AdminController],
  providers: [AdminService, TestService, ReadingService, ListeningService, WritingService],
})
export class AdminModule {}
