import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
    @Prop({ required: true })
    conversationId: string;

    @Prop({ required: true })
    sender: string

    @Prop({ required: true })
    text: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
