import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTestDto } from '../dtos/create-test.dto';
import { ListeningService } from 'src/listening/listening.service';
import { ReadingService } from 'src/reading/reading.service';
import { WritingService } from 'src/writing/writing.service';
import { SubmitAnswersDto } from 'src/dtos/submit-answers-dto';
import { clerkClient } from '@clerk/express';

@Injectable()
export class TestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly readingService: ReadingService,
    private readonly writingService: WritingService,
    private readonly listeningService: ListeningService,
  ) {}
  async createTest(createTestDto: CreateTestDto) {
    const checkTitleUnique = await this.prisma.test.findFirst({
      where: { title: createTestDto.title },
    });

    if (checkTitleUnique) {
      throw new ConflictException('Test title already exists');
    }

    const test = await this.prisma.test.create({
      data: {
        title: createTestDto.title,
        description: createTestDto.description,
      },
    });
    return {
      testId: test.id,
    };
  }

  async getAllTests() {
    const tests = await this.prisma.test.findMany();
    for (const test of tests) {
      test.duration = await this.calculateTestDuration(test.id);
    }
    return tests;
  }
  async getTestById(testId: number) {
    const test = await this.findTest(testId);
    const readingTest = await this.readingService.getReadingTestById(testId);
    const writingTest = await this.writingService.getWritingTestById(testId);
    const listeningTest =
      await this.listeningService.getListeningTestById(testId);

    return {
      ...test,
      parts: [readingTest, writingTest, listeningTest].filter(Boolean),
    };
  }
  async createTestResult(testId: number, userId: string, part: string, submissionId: number) {
    const test = await this.findTest(testId);
    if (!test) {
      throw new NotFoundException('Test not found');
    }

    const user = await clerkClient.users.getUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create data object with only the relevant test ID field based on part
    const data: any = {
      userId,
      submissionId,
      testType: part,
    };

    // Set only the appropriate test ID field
    switch (part.toLowerCase()) {
      case 'reading':
        data.readingTestId = testId;
        break;
      case 'writing':
        data.writingTestId = testId;
        break;
      case 'listening':
        data.listeningTestId = testId;
        break;
      default:
        throw new BadRequestException('Invalid test part specified');
    }

    const userTestResult = await this.prisma.userTestResult.create({
      data,
    });

    return userTestResult;
  }
  async createSubmission(testId: number, userId: string) {
    const test = await this.findTest(testId);
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    const user = await clerkClient.users.getUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const data = {
      userId,
      testId,
      testName: test.title,
    };
    const submission = await this.prisma.submission.create({data});
    return submission;
  }
  async getTestResults(submisionId: number) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submisionId },
    })
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    const userTestResults = await this.prisma.userTestResult.findMany({
      where: { submissionId: submisionId },
    });
    if (!userTestResults) {
      throw new NotFoundException('User test results not found');
    }
    return {
      submission,
      userTestResults
    }
  }
  async submitTest(testId: number, submitAnswersDto: SubmitAnswersDto, userId: string) {
    // create submission
    const submission = await this.createSubmission(testId, userId);
    // create test result
    if (submitAnswersDto.readingAnswers) {
      const userTestResult = await this.createTestResult(testId, userId, 'reading', submission.id);
      await this.readingService.submitReadingPart(userTestResult.id, submitAnswersDto);
    }
    if (submitAnswersDto.writingAnswers) {
      const userTestResult = await this.createTestResult(testId, userId, 'writing', submission.id);
      await this.writingService.submitWritingPart(userTestResult.id, submitAnswersDto);
    }
    if (submitAnswersDto.listeningAnswers){
      const userTestResult = await this.createTestResult(testId, userId, 'listening', submission.id);
      await this.listeningService.submitListeningPart(userTestResult.id, submitAnswersDto);
    }
    // update submission
    await this.updateSubmission(submission.id);
    
    return {
      submissionId: submission.id,
      status: 'submitted',
      submittedAt: new Date(),
    }
  }
  async updateSubmission(submisionId: number) {
    const userTestResults = await this.prisma.userTestResult.findMany({
      where: { submissionId: submisionId },
    })
    const totalScore = userTestResults.reduce((acc, userTestResult) => acc + userTestResult.score, 0);
    const totalCorrect = userTestResults.reduce((acc, userTestResult) => acc + userTestResult.totalCorrect, 0);
    const totalIncorrect = userTestResults.reduce((acc, userTestResult) => acc + userTestResult.totalIncorrect, 0);
    const completionTime = userTestResults[0].completionTimeSeconds
    await this.prisma.submission.update({
      where: { id: submisionId },
      data: {
        totalScore,
        totalCorrect,
        totalIncorrect,
        completionTimeSeconds: completionTime,
      }
    })
    
  }
  //helper function to calculate the duration of the test
  private async calculateTestDuration(testId: number) {
    const readingTest = await this.prisma.readingTest.findFirst({
      where: { testId: testId },
    });
    const writingTest = await this.prisma.writingTest.findFirst({
      where: { testId: testId },
    });
    const listeningTest = await this.prisma.listeningTest.findFirst({
      where: { testId: testId },
    });
    return (
      (readingTest?.duration || 0) +
      (writingTest?.duration || 0) +
      (listeningTest?.duration || 0)
    );
  }
  //helper function to validate test
  private async findTest(testId: number) {
    const test = await this.prisma.test.findFirst({
      where: { id: testId },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }
}
