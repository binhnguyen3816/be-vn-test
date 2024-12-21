import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async createUser(createUserDto: CreateUserDto, userId: string) {
        if (await this.findByEmail(createUserDto.email)) {
            throw new BadRequestException('Email already exists');
        }
        if (await this.findByUsername(createUserDto.username)) {
            throw new BadRequestException('Username already exists');
        }
        return await this.prisma.user.create({ data: { ...createUserDto, id: userId } });
    }

    async getUserById(userId: string) {
        const user = this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    private async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    private async findByUsername(username: string) {
        return this.prisma.user.findUnique({ where: { username } });
    }
}
