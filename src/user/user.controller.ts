import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpException,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.userService.registerUser(registerUserDto);
    return user;
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    const user = await this.userService.loginUser(loginUserDto);
    return user;
  }

  @Get('/get/me')
  async getMe(@Req() req: any) {
    const userId = req.userId;

    if (!userId) {
      throw new HttpException(
        'У вас нет доступа, пройдите аутентификацию',
        403,
      );
    }

    const user: any = await this.userService.getUser(userId);

    if (!user) {
      throw new HttpException('Пользователь не найден', 404);
    }

    delete user._doc.password;
    return user;
  }

  @Get('get/:id')
  async getUser(@Param('id') id: string) {
    const user: any = await this.userService.getUser(id);

    const { password, ...userData } = user._doc;
    return userData;
  }

  @Get('/list')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Patch('edit/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.updateUser(id, updateUserDto);
    return 'User updated';
  }

  @Post('subscribe/:id')
  async subscribe(@Param('id') id: string, @Request() req: any) {
    await this.userService.subscribe(id, req);
    return 'Subscribed';
  }

  @Post('unsubscribe/:id')
  async unsubscribe(@Param('id') id: string, @Request() req: any) {
    await this.userService.unsubscribe(id, req);
    return 'Unsubscribed';
  }

  @Get('/subscribers/list/:id')
  fetchUsersSubscribers(@Param('id') id: string) {
    const users = this.userService.fetchUsersSubscribers(id);
    return users;
  }

  @Get('/subscribed/list/:id')
  fetchUsersSubscribed(@Param('id') id: string) {
    const users = this.userService.fetchUsersSubscribed(id);
    return users;
  }

  @Get('/not/subscribed/users/:id')
  fechUsersNoSub(@Param('id') id: string) {
    const users = this.userService.fechUsersNoSub(id);
    return users;
  }
}
