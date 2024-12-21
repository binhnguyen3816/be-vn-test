import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { PrismaModule } from './prisma.module';
import { UserController } from './user/user.controller';
import { AdminModule } from './admin/admin.module';
import { TestModule } from './test/test.module';
import { ReadingModule } from './reading/reading.module';
import { ListeningModule } from './listening/listening.module';
import { WritingModule } from './writing/writing.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AdminModule,
    TestModule,
    ReadingModule,
    ListeningModule,
    WritingModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
