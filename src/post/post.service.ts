import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePostDto } from 'src/dtos/create-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(createPostDto: CreatePostDto) {
    try {
      return await this.prisma.post.create({
        data: createPostDto,
      });
    } catch (error) {
      throw new ServiceUnavailableException('Database operation failed.');
    }
  }

  async getAllPosts() {
    return await this.prisma.post.findMany();
  }

  async getPostById(id: number) {
    const post = await this.prisma.post.findUnique({
        where: { id },
    });
    if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found.`);
    }
    return post;
  }

  async updatePostById(id: number, updatePostDto: CreatePostDto) {
    try {
        const existingPost = await this.prisma.post.findUnique({ where: { id } });
        if (!existingPost) {
            throw new NotFoundException(`Post with ID ${id} not found.`);
        }
        return await this.prisma.post.update({
            where: { id },
            data: updatePostDto,
        });
    } catch (error) {
        throw new BadRequestException('Failed to update the post. Ensure the data is valid.');
    }
  }

  async deletePostById(id: number) {
    try {
        const existingPost = await this.prisma.post.findUnique({ where: { id } });
        if (!existingPost) {
            throw new NotFoundException(`Post with ID ${id} not found.`);
        }
        return await this.prisma.post.delete({
            where: { id },
        });
    } catch (error) {
        throw new BadRequestException('Failed to delete the post.');
    }
  }
}
