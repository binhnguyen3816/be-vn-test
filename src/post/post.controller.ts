import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from 'src/dtos/create-post.dto';

@Controller('v1/post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Post()
    async createPost(@Body() createPostDto: CreatePostDto) {
        return await this.postService.createPost(createPostDto);
    }

    @Get()
    async getPosts() {
        return await this.postService.getAllPosts();
    }

    @Get(':id')
    async getPostById(@Param('id', ParseIntPipe) id: number) {
        return await this.postService.getPostById(id);
    }

    @Put(':id')
    async updatePostById(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: CreatePostDto) {
        return await this.postService.updatePostById(id, updatePostDto);
    }

    @Delete(':id')
    async deletePostById(@Param('id', ParseIntPipe) id: number) {
        return await this.postService.deletePostById(id);
    }

}
