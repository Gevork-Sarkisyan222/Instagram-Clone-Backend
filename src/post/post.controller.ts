import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/CreatePost.dto';
import { UpdateUserDto } from 'src/user/dto/updateUser.dto';
import { UpdatePostDto } from './dto/UpdatePost.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post('create')
  async createPost(@Body() createPost: CreatePostDto, @Request() req: any) {
    const post = await this.postService.createPost(createPost, req);
    return post;
  }

  @Delete('/delete/:id')
  async deletePost(@Param('id') id: string, @Request() req: any) {
    await this.postService.deletePost(id, req);
    return 'Post has been deleted';
  }

  @Patch('/edit/:id')
  async editPost(
    @Body() updateUserDto: UpdatePostDto,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.postService.editPost(updateUserDto, id, req);
    return 'Post edited';
  }

  @Get('/getAll')
  getAllPost() {
    const posts = this.postService.getAllPosts();
    return posts;
  }

  @Get('/get/:id')
  getOnePost(@Param('id') id: string) {
    const post = this.postService.getOnePost(id);
    return post;
  }

  @Post('/like/:id')
  async likePost(@Param('id') id: string, @Request() req: any) {
    await this.postService.likePost(id, req);
    return 'Post has been liked';
  }

  @Get('/liked/users/:id')
  async getLikedUsers(@Param('id') id: string) {
    const likedUsers = await this.postService.getLikedUsers(id);
    return likedUsers;
  }

  @Delete('/unlike/:id')
  async removeLikePost(@Param('id') id: string, @Request() req: any) {
    await this.postService.removeLike(id, req);
    return 'Post has been unliked';
  }

  @Post('/save/:id')
  async savePost(@Param('id') id: string, @Request() req: any) {
    await this.postService.savePost(id, req);
    return 'Post has been saved';
  }

  @Delete('/removeSave/:id')
  async removeSave(@Param('id') id: string, @Request() req: any) {
    await this.postService.removeSave(id, req);
    return 'Post has been unsaved';
  }

  @Get('/get/users/liked/posts/:id')
  async fetchUsersLikedPosts(@Param('id') id: string) {
    const likedPosts = await this.postService.fetchUsersLikedPosts(id);
    return likedPosts;
  }

  @Get('/get/users/saved/posts/:id')
  async fetchUsersSavedPosts(@Param('id') id: string) {
    const savedPosts = await this.postService.fetchUsersSavedPosts(id);
    return savedPosts;
  }

  // put into params a user Id to find his created posts
  @Get('/get/users/created/posts/:id')
  async fetchUsersCreatedPosts(@Param('id') id: string) {
    const createdPosts = await this.postService.fetchUsersCreatedPosts(id);
    return createdPosts;
  }
}
