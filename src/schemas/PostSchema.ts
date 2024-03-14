import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ required: false })
  tags?: string;

  @Prop({ default: [] })
  likes: string[];

  @Prop({ default: [] })
  saves: string[];

  @Prop({ default: 0 })
  viewers: number;

  @Prop({ default: [] })
  comments: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
