import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
    @Prop({ required: true })
    text: string;

    @Prop({ type: Types.ObjectId, ref: 'Post' })
    postId: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: 'User' })
    user: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
