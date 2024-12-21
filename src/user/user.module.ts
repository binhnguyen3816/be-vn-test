import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TestService } from 'src/test/test.service';
import { TestModule } from 'src/test/test.module';
import { ReadingModule } from 'src/reading/reading.module';
import { ReadingService } from 'src/reading/reading.service';
import { ListeningService } from 'src/listening/listening.service';
import { WritingService } from 'src/writing/writing.service';
import { UserService } from './user.service';

@Module({
  imports: [TestModule],
  controllers: [UserController],
  providers: [TestService, ReadingService, ListeningService, WritingService, UserService],
})
export class UserModule {}
