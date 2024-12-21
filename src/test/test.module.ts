import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { ReadingModule } from 'src/reading/reading.module';
import { ListeningModule } from 'src/listening/listening.module';
import { WritingModule } from 'src/writing/writing.module';
import { ReadingService } from 'src/reading/reading.service';
import { ListeningService } from 'src/listening/listening.service';
import { WritingService } from 'src/writing/writing.service';

@Module({
  imports: [ReadingModule, ListeningModule, WritingModule],
  providers: [TestService, ReadingService, ListeningService, WritingService],
})
export class TestModule {}
