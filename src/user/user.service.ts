import { HttpException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/registerUser.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/UserSchema';
import { LoginUserDto } from './dto/loginUser.dto';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  generateJwt(userId: string): string {
    const oneMountExpires = 30 * 24 * 60 * 60;
    return sign({ _id: userId }, 'secret123', {
      expiresIn: oneMountExpires,
    });
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerUserDto.password, salt);
    const user = new this.userModel({
      userName: registerUserDto.userName,
      email: registerUserDto.email,
      password: hashedPassword,
      avatarUrl: registerUserDto.avatarUrl,
    });

    const savedUser: any = await user.save();

    const token = this.generateJwt(savedUser._id);

    delete savedUser._doc.password;

    return {
      ...savedUser._doc,
      token,
    };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const user: any = await this.userModel.findOne({
      userName: loginUserDto.userName,
    });

    if (!user) {
      throw new HttpException(
        'Пользователь с указанным именем пользователя не найден.',
        404,
      );
    }

    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);

    if (!isMatch) {
      throw new HttpException('Неправильное имя пользователя или пароль.', 500);
    }

    const token = this.generateJwt(user._id);

    delete user._doc.password;

    return {
      ...user._doc,
      token,
    };
  }

  getUser(id: string) {
    const user = this.userModel.findById(id);
    return user;
  }

  async getAllUsers() {
    const users = await this.userModel.aggregate([{ $sample: { size: 100 } }]);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return usersWithoutPassword;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto);

    return user;
  }

  async subscribe(id: string, req: any) {
    if (!req.userId) {
      throw new HttpException(
        'Вы не аутентифицированный, вы не можете создавать посты',
        403,
      );
    }

    const user = await this.userModel.findById(id);
    if (!user || user.subscribers.includes(req.userId)) {
      throw new HttpException('Вы уже подписаны на этого пользователя', 400);
    }

    const currentUser = await this.userModel.findById(req.userId);
    if (!currentUser || currentUser.subscribed.includes(id)) {
      throw new HttpException('Вы уже подписаны на этого пользователя', 400);
    }

    await this.userModel.findByIdAndUpdate(id, {
      $push: { subscribers: req.userId },
    });

    await this.userModel.findByIdAndUpdate(req.userId, {
      $push: { subscribed: id },
    });
  }

  async unsubscribe(id: string, req: any) {
    if (!req.userId) {
      throw new HttpException(
        'Вы не аутентифицированный, вы не можете создавать посты',
        403,
      );
    }

    await this.userModel.findByIdAndUpdate(id, {
      $pull: { subscribers: req.userId },
    });

    await this.userModel.findByIdAndUpdate(req.userId, {
      $pull: { subscribed: id },
    });
  }

  async fetchUsersSubscribers(id: string) {
    const user = await this.userModel.findById(id);
    const usersSubscribers = user.subscribers.map((subscriber) => subscriber);

    const foundUsers = await this.userModel.find({
      _id: { $in: usersSubscribers },
    });

    return foundUsers;
  }

  async fetchUsersSubscribed(id: string) {
    const user = await this.userModel.findById(id);
    const usersSubscribers = user.subscribed.map((subscribed) => subscribed);

    const foundSubscribedUsers = await this.userModel.find({
      _id: { $in: usersSubscribers },
    });

    return foundSubscribedUsers;
  }

  async fechUsersNoSub(id: string) {
    const user = await this.userModel.findById(id);
    const usersSubscribedIds = user.subscribed.map((subscribedUser) =>
      subscribedUser.toString(),
    );

    const notSubscribedUsers = await this.userModel.find({
      _id: { $nin: [...usersSubscribedIds, id] },
    });

    return notSubscribedUsers;
  }

  async deleteSubscriberUser(id: string, req: any) {
    try {
      if (!req.userId) {
        throw new HttpException(
          'Вы не аутентифицированный',
          403,
        );
      }

      if (!id) {
        throw new HttpException('Невозможно найти пользователья', 404)
      }

      await this.userModel.findByIdAndUpdate(req.userId, {
        $pull: { subscribers: id },
      });

      await this.userModel.findByIdAndUpdate(id, {
        $pull: { subscribed: req.userId },
      });

      return { message: 'Subscriber user has been deleted' };

    } catch (err) {
      console.warn(err)
      throw new HttpException(`Ошибка при удаления пользователья ${err}`, 500)
    }
  }


  async returnSubscriberUser(id: string, req: any) {
    try {
      if (!req.userId) {
        throw new HttpException(
          'Вы не аутентифицированный',
          403,
        );
      }

      if (!id) {
        throw new HttpException('Невозможно найти пользователья', 404)
      }

      await this.userModel.findByIdAndUpdate(req.userId, {
        $push: { subscribers: id },
      });

      await this.userModel.findByIdAndUpdate(id, {
        $push: { subscribed: req.userId },
      });

      return { message: 'Subscriber user has been deleted' };

    } catch (err) {
      console.warn(err)
      throw new HttpException(`Ошибка при удаления пользователья ${err}`, 500)
    }
  }
}
