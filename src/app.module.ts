import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { AuthUser } from './middleware/authUser';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://newcor9:youtube-server-code@youtube-server.maijdmg.mongodb.net/Instagram?retryWrites=true&w=majority',
    ),
    UserModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthUser).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}

