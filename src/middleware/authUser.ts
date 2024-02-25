import { Injectable, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { User } from 'src/schemas/UserSchema';

export interface ExpressRequest extends Request {
  userId?: string;
}

@Injectable()
export class AuthUser implements NestMiddleware {
  constructor(private userService: UserService) {}

  async use(req: ExpressRequest, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.userId = null;
      next();
      return;
    }

    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

    try {
      const decode = verify(token, 'secret123') as { _id: string };
      const userId = decode._id;
      //   const user = this.userService.getUser(decode._id);
      req.userId = userId;
      next();
    } catch (err) {
      req.userId = null;
      next();
    }
  }
}
