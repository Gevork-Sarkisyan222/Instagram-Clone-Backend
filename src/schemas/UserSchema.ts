import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ default: 'Новый пользователь инстаграма' })
  desc?: string;

  @Prop({ default: 'user' })
  role?: string;

  @Prop({ default: false })
  checkMark?: boolean;

  @Prop({ default: false })
  facebook?: boolean;

  @Prop({ default: false })
  blocked?: boolean;

  @Prop({ default: [] })
  createdPosts?: string[];

  @Prop({ default: [] })
  likedPosts?: string[];

  @Prop({ default: [] })
  savedPosts?: string[];

  @Prop({ default: [] })
  subscribers?: string[];

  @Prop({ default: [] })
  subscribed?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
