import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/UserSchema';
import { CreatePostDto } from './dto/CreatePost.dto';
import { Post } from '../schemas/PostSchema';
import { Comment } from '../schemas/CommentSchema';
import { UpdatePostDto } from './dto/UpdatePost.dto';
import { CreateCommentDto } from './dto/CreateComment.dto';
import { UpdateCommentDto } from './dto/UpdateComment.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) { }

  async createPost(createPostDto: CreatePostDto, req: any) {
    try {
      if (!req.userId) {
        throw new HttpException(
          'Вы не аутентифицированный, вы не можете создавать посты',
          403,
        );
      }

      const user = await this.userModel.findById(req.userId);

      if (!user) {
        throw new HttpException('Пользователь не найден', 404);
      }

      const post = new this.postModel({
        imageUrl: createPostDto.imageUrl,
        desc: createPostDto.desc,
        tags: createPostDto.tags,
        user: user,
      });

      const savedPost = await post.save();

      await this.userModel.findByIdAndUpdate(req.userId, {
        $push: { createdPosts: post._id.toString() },
      });

      return savedPost;
    } catch (err) {
      console.warn(err);
      throw new HttpException('Ошибка при создании поста', 400);
    }
  }

  async deletePost(id: string, req: any) {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new HttpException('Пост не найден', 400);
    }

    if (!req.userId) {
      throw new HttpException(
        'Вы не аутентифицированный, вы не можете создавать посты',
        403,
      );
    }

    if (req.userId !== post.user._id.toString()) {
      throw new HttpException(
        'Это не твой пост и ты не можешь удалить его',
        403,
      );
    }

    await this.postModel.findByIdAndDelete(id);
    await this.userModel.findByIdAndUpdate(req.userId, {
      $pull: { createdPosts: post._id.toString() },
    });

    return post;
  }

  async editPost(updatePostDto: UpdatePostDto, id: string, req: any) {
    if (!req.userId) {
      throw new HttpException(
        'Вы не аутентифицированный, вы не можете создавать посты',
        403,
      );
    }

    const editedPost = await this.postModel.findByIdAndUpdate(
      id,
      updatePostDto,
    );

    // if (req.userId !== editedPost.user._id) {
    //   throw new HttpException(
    //     'Это не твой пост и ты не можешь удалить его',
    //     403,
    //   );
    // }

    return editedPost;
  }

  async getAllPosts() {
    const posts = await this.postModel.aggregate([
      { $sample: { size: 100 } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ]);

    return posts;
  }

  async getOnePost(id: string) {
    const post = await this.postModel
      .findByIdAndUpdate(id, {
        $inc: { viewers: 1 },
      })
      .populate('user');
    return post;
  }

  async likePost(id: string, req: any) {
    if (!req.userId) {
      throw new HttpException(
        'Вы не аутентифицированный, вы не можете создавать посты',
        403,
      );
    }

    const post = await this.postModel.findById(id);
    if (!post.likes.includes(req.userId)) {
      const likedPost = await this.postModel.findByIdAndUpdate(id, {
        $push: { likes: req.userId },
      });

      await this.userModel.findByIdAndUpdate(req.userId, {
        $push: { likedPosts: id },
      });

      return likedPost;
    } else {
      throw new HttpException('Вы уже лайкали этот пост', 400);
    }
  }
  async getLikedUsers(id: string) {
    const likedPost = await this.postModel.findById(id);
    const likedUserIds = likedPost.likes;

    const likedUsers = await this.userModel.find({
      _id: { $in: likedUserIds },
    });

    return likedUsers;
  }

  async removeLike(id: string, req: any) {
    const likedPost = await this.postModel.findByIdAndUpdate(id, {
      $pull: { likes: req.userId },
    });

    await this.userModel.findByIdAndUpdate(req.userId, {
      $pull: { likedPosts: id },
    });

    return likedPost;
  }

  async savePost(id: string, req: any) {
    if (!req.userId) {
      throw new HttpException(
        'Вы не аутентифицированный, вы не можете создавать посты',
        403,
      );
    }

    const post = await this.postModel.findById(id);
    if (!post || post.saves.includes(req.userId)) {
      return;
    }

    const user = await this.userModel.findById(req.userId);
    if (!user || user.savedPosts.includes(id)) {
      return;
    }

    const savedPost = await this.postModel.findByIdAndUpdate(id, {
      $push: { saves: req.userId },
    });

    await this.userModel.findByIdAndUpdate(req.userId, {
      $push: { savedPosts: id },
    });

    return savedPost;
  }

  async removeSave(id: string, req: any) {
    if (!req.userId) {
      throw new HttpException(
        'Вы не аутентифицированный, вы не можете создавать посты',
        403,
      );
    }

    const savedPost = await this.postModel.findByIdAndUpdate(id, {
      $pull: { saves: req.userId },
    });

    await this.userModel.findByIdAndUpdate(req.userId, {
      $pull: { savedPosts: id },
    });

    return savedPost;
  }

  // its for profile
  async fetchUsersLikedPosts(id: string) {
    const user = await this.userModel.findById(id);
    const usersLikedPosts = user.likedPosts.map((posts) => posts);

    const foundPosts = await this.postModel
      .find({
        _id: { $in: usersLikedPosts },
      })
      .populate('user');

    return foundPosts;
  }

  async fetchUsersSavedPosts(id: string) {
    const user = await this.userModel.findById(id);
    const usersSavedPosts = user.savedPosts.map((posts) => posts);

    const foundPosts = await this.postModel
      .find({
        _id: { $in: usersSavedPosts },
      })
      .populate('user');

    return foundPosts;
  }

  async fetchUsersCreatedPosts(id: string) {
    const user = await this.userModel.findById(id);
    const usersCreatedPosts = user.createdPosts.map((posts) => posts);

    const foundCreatedPosts = await this.postModel
      .find({
        _id: { $in: usersCreatedPosts },
      })
      .populate('user');

    return foundCreatedPosts;
  }



  // create comments
  async createComment(createCommentDto: CreateCommentDto, postId: string, req: any) {
    try {
      if (!req.userId) {
        throw new HttpException('Вы не аутентифицированный, вы не можете создавать комментария', 403)
      }

      const comment = new this.commentModel({
        postId,
        text: createCommentDto.text,
        user: req.userId,
      })

      const savedComment = await comment.save();

      await this.postModel.findByIdAndUpdate(postId, {
        $push: { comments: savedComment._id }
      });

      return savedComment
    } catch (err) {
      console.warn(err);
      throw new HttpException('Произошла ошибка при создании комментария', 500)
    }
  }


  async deleteComment(commentId: string, req: any) {
    try {
      if (!req.userId) {
        throw new HttpException('Вы не аутентифицированный, вы не можете удалить комментария', 403)
      }

      const comment = await this.commentModel.findById(commentId);

      if (!comment) {
        throw new HttpException('Комментарий не найден', 404);
      }


      const postId = comment.postId
      console.log(comment.postId)

      if (!postId) {
        throw new HttpException('PostId не найдено', 404)
      }

      await this.postModel.findByIdAndUpdate(postId, {
        $pull: { comments: commentId }
      });


      await this.commentModel.findByIdAndDelete(commentId);

      return 'Comment has been deleted!'

    } catch (err) {
      console.warn(err);
      throw new HttpException(`Произошла ошибка при удалении комментария ${err}`, 500)
    }
  }

  async updateComment(commentId: string, updateCommentDto: UpdateCommentDto, req: any) {
    try {
      if (!req.userId) {
        throw new HttpException('Вы не аутентифицированный, вы не можете удалить комментария', 403)
      }


      const updatedComment = await this.commentModel.findByIdAndUpdate(commentId, {
        text: updateCommentDto.text
      }, { new: true });

      if (!updatedComment) {
        throw new HttpException('Комментарий не найден', 404);
      }

      return updatedComment;
    } catch (err) {
      console.warn(err);
      throw new HttpException(`${err}`, 500)
    }
  }
}



