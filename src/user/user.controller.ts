import { UserService } from './user.service';
import { ReadingService } from '../reading/reading.service';
import { TestService } from './../test/test.service';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WritingService } from '../writing/writing.service';
import { ListeningService } from '../listening/listening.service';
import { SubmitAnswersDto } from '../dtos/submit-answers-dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ClerkAuthGuard } from 'auth/clerk-auth.guard';
import { clerkClient, getAuth } from '@clerk/express';
import { get } from 'http';

@Controller('v1')
@UseGuards(ClerkAuthGuard)
export class UserController {
  constructor(
    private readonly testService: TestService,
    private readonly readingService: ReadingService,
    private readonly writingService: WritingService,
    private readonly listeningService: ListeningService,
    private readonly userService: UserService,
  ) {}

  @Get('tests')
  async getAllTests() {
    return await this.testService.getAllTests();
  }

  @Get('tests/:testId')
  async getTest(@Param('testId', ParseIntPipe) testId: number) {
    return await this.testService.getTestById(testId);
  }
  @Get('tests/:submissionId/results')
  async getTestResults(
    @Param('submissionId', ParseIntPipe) submissionId: number,
  ) {
    return await this.testService.getTestResults(submissionId);
  }
  @Get('tests/:testId/:part')
  async getQuestions(
    @Param('testId', ParseIntPipe) testId: number,
    @Param('part') part: string,
  ) {
    if (part === 'reading') {
      return await this.readingService.getReadingQuestions(testId);
    } else if (part === 'writing') {
      return await this.writingService.getWritingQuestions(testId);
    } else if (part === 'listening') {
      return await this.listeningService.getListeningQuestions(testId);
    } else {
      return new ConflictException('Invalid part');
    }
  }
  @Post('tests/:testId/submit')
  async submitPart(
    @Param('testId', ParseIntPipe) testId: number,
    @Body() submitAnswersDto: SubmitAnswersDto,
    @Req() req: any,
  ) {
    const { userId } = getAuth(req);
    return await this.testService.submitTest(testId, submitAnswersDto, userId);
  }
  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    const {userId} = getAuth(req);
    return await this.userService.createUser(createUserDto, userId);
  }
  @Get('users')
  async getUser(@Req() req: any) {
    const {userId} = getAuth(req);
    return await this.userService.getUserById(userId); 
  }
}
