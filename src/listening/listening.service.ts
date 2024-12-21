import { CreateListeningSubpart } from './../dtos/create-listening-subpart.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePartDto } from 'src/dtos/create-part.dto';
import { CreateQuestionDto } from 'src/dtos/create-question.dto';
import { SubmitAnswersDto } from 'src/dtos/submit-answers-dto';
import { UpdateTestResultDto } from 'src/dtos/update-test-result.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ListeningService {
  constructor(private readonly prisma: PrismaService) {}

  async createListeningPart(testId: number, createPartDto: CreatePartDto) {
    await this.validateTest(testId);
    await this.checkUniqueListeningPart(testId);

    const newPart = await this.prisma.listeningTest.create({
      data: {
        testId: testId,
        description: createPartDto.description,
        duration: createPartDto.duration,
        totalQuestions: createPartDto.totalQuestion,
        listeningFileUrl: createPartDto.audioUrl,
      },
    });
    return { partId: newPart.id };
  }
  async createListeningSubpart(
    testId: number,
    createListeningSubpartDto: CreateListeningSubpart,
  ) {
    await this.validateTest(testId);
    const listeningTest = await this.findListeningTest(testId);

    const newSubpart = await this.prisma.listeningSubpart.create({
      data: {
        listeningTestId: listeningTest.id,
        title: createListeningSubpartDto.title,
        description: createListeningSubpartDto.description,
        listeningPassage: createListeningSubpartDto.passage,
        duration: createListeningSubpartDto.duration,
        totalQuestions: createListeningSubpartDto.totalQuestions,
      },
    });
    return { subpartId: newSubpart.id };
  }
  async createListeningQuestion(
    subpartId: number,
    createQuestionDto: CreateQuestionDto,
  ) {
    await this.validateListeningSubpart(subpartId);
    const newQuestion = await this.prisma.listeningQuestion.create({
      data: {
        listeningSubpartId: subpartId,
        questionNumber: createQuestionDto.questionNumber,
        questionText: createQuestionDto.questionText,
      },
    });
    await this.createListeningQuestionOptions(
      newQuestion.id,
      createQuestionDto,
    );
    return { questionId: newQuestion.id };
  }
  async createListeningQuestionOptions(
    questionId: number,
    createQuestionDto: CreateQuestionDto,
  ) {
    await this.prisma.listeningQuestionOption.createMany({
      data: createQuestionDto.answers.map((answer, index) => {
        return {
          listeningQuestionId: questionId,
          optionLabel: ['A', 'B', 'C', 'D'][index],
          optionText: answer,
          isCorrect: createQuestionDto.correctAnswer === answer ? true : false,
        };
      }),
    });
  }
  async getListeningTestById(testId: number) {
    const listeningTest = await this.prisma.listeningTest.findFirst({
      where: { id: testId },
    });
    if (listeningTest) {
      return { part: 'listening', ...listeningTest };
    }
  }

  async getListeningQuestions(testId: number) {
    const listeningTest = await this.findListeningTest(testId);
    const listeningSubparts = await this.findListeningSubparts(
      listeningTest.id,
    );
    return await Promise.all(
      listeningSubparts.map(async (subpart) => ({
        ...subpart,
        questions: await this.getListeningQuestionsOfSubpart(subpart.id),
      })),
    );
  }
  async getListeningQuestionsOfSubpart(listeningSubpartId: number) {
    const listeningQuestions =
      await this.findListeningQuestions(listeningSubpartId);
    return await Promise.all(
      listeningQuestions.map(async (question) => ({
        ...question,
        options: await this.getListeningQuestionOptions(question.id),
      }))
    )
  }
  async getListeningQuestionOptions(questionId: number) {
    const listeningQuestionOptions =
      await this.prisma.listeningQuestionOption.findMany({
        where: { listeningQuestionId: questionId },
      });
    if (!listeningQuestionOptions) {
      throw new NotFoundException('Listening question options not found');
    }
    return listeningQuestionOptions;
  }
  async createListeningAnswers(
    userTestResultId: number,
    submitAnswersDto: SubmitAnswersDto,
  ) {
    const { testId, completionTimeSeconds, readingAnswers, listeningAnswers, writingAnswers } = submitAnswersDto;
    const listeningQuestions = await this.findListeningQuestionsOfTest(testId);
    const AnswerData = [];

    for (const question of listeningQuestions) {
      const selectedOption = this.findAnswerText(question.id, listeningAnswers);
      const isCorrect = selectedOption !== null && selectedOption !== undefined
        ? question.options.some(
            (option: any) => option.optionText === selectedOption && option.isCorrect
          )
        : false;

      AnswerData.push({
        userTestResultId: userTestResultId,
        questionType: 'listening',
        listeningQuestionId: question.id,
        selectedOption: selectedOption || null,
        isCorrect: isCorrect,
      });
    }

    await this.prisma.userAnswer.createMany({
      data: AnswerData,
    });

    return AnswerData;
  }
  async updateListeningTestResult(userTestResultId: number, AnswerData: UpdateTestResultDto[], completionTimeSeconds: number) {
    const numberOfCorrectAnswers = AnswerData.filter(
      (answer) => answer.isCorrect,
    ).length;
    const numberOfSelectedOptions = AnswerData.filter(
      (answer) => answer.selectedOption !== null,
    ).length;

    const updatedTestResult = await this.prisma.userTestResult.update({
      where: { id: userTestResultId },
      data: {
        totalCorrect: numberOfCorrectAnswers,
        totalIncorrect: numberOfSelectedOptions - numberOfCorrectAnswers,
        completionTimeSeconds: completionTimeSeconds,
        score: (numberOfCorrectAnswers / AnswerData.length) * 100,
      },
    });
    return updatedTestResult;
  }
  async submitListeningPart(userTestResultId: number, submitAnswersDto: SubmitAnswersDto) {
    const { testId, completionTimeSeconds, readingAnswers, listeningAnswers, writingAnswers } = submitAnswersDto;
    const AnswerData = await this.createListeningAnswers(
      userTestResultId,
      submitAnswersDto,
    );
    await this.updateListeningTestResult(userTestResultId, AnswerData, completionTimeSeconds);

    return {
      submissionId: userTestResultId,
      status: 'submitted',
      submittedAt: new Date(),
    };
  }
  async getListeningTestResult(listeningTestId: number) {
    const listeningTestResult = await this.prisma.userTestResult.findFirst({
      where: { listeningTestId: listeningTestId },
    })
    return listeningTestResult
  }
  async findListeningQuestionsOfTest(testId: number) {
    const listeningQuestions = await this.getListeningQuestions(testId);
    const questionList = [];

    for (const listeningQuestion of listeningQuestions) {
      const questions = await this.getListeningQuestionsOfSubpart(
        listeningQuestion.id,
      );
      // Use Array.flat() if answers might be nested arrays
      questionList.push(...questions.flat());
    }
    return questionList;
  }
  private findAnswerText(questionId: number, answers: any) {
    const answer = answers.find(
      (answer: any) => answer.questionId === questionId,
    );
    return answer?.answerText;
  }
  // Helper function to check if test exists
  private async validateTest(testId: number) {
    const test = await this.prisma.test.findFirst({
      where: { id: testId },
    });
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }
  // Helper function to check if listening part is unique
  private async checkUniqueListeningPart(testId: number) {
    const listeningTest = await this.prisma.listeningTest.findFirst({
      where: { testId: testId },
    });
    if (listeningTest) {
      throw new BadRequestException(
        'Listening part already exists in the test',
      );
    }
  }
  // Helper function to find listening test
  private async findListeningTest(subpartId: number) {
    const listeningTest = await this.prisma.listeningTest.findFirst({
      where: { id: subpartId },
    });
    if (!listeningTest) {
      throw new NotFoundException('Listening subpart not found');
    }
    return listeningTest;
  }
  // Helper function to check if listening subpart exists
  private async validateListeningSubpart(subpartId: number) {
    const listeningSubpart = await this.prisma.listeningSubpart.findFirst({
      where: { id: subpartId },
    });
    if (!listeningSubpart) {
      throw new NotFoundException('Listening subpart not found');
    }
    return listeningSubpart;
  }
  // Helper function to find listening subparts
  private async findListeningSubparts(listeningTestId: number) {
    const listeningSubparts = await this.prisma.listeningSubpart.findMany({
      where: { listeningTestId: listeningTestId },
    });
    if (!listeningSubparts) {
      throw new NotFoundException('Listening subparts not found');
    }
    return listeningSubparts;
  }
  // Helper function to find listening questions of a listening subpart
  private async findListeningQuestions(listeningSubpartId: number) {
    const listeningQuestions = await this.prisma.listeningQuestion.findMany({
      where: { listeningSubpartId: listeningSubpartId },
    });
    if (!listeningQuestions) {
      throw new NotFoundException('Listening questions not found');
    }
    return listeningQuestions;
  }
}
