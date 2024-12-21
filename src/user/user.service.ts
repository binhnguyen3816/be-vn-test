import { clerkClient } from '@clerk/express';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async getUserById(userId: string) {
        const user = await clerkClient.users.getUser(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
    async getAllUsers() {
        const users = await clerkClient.users.getUserList();
        return users;
    }
}
