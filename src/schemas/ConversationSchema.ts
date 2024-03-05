import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
    // @Prop({ type: Types.ObjectId, ref: 'User' })
    // reciverId: Types.ObjectId

    // @Prop({ type: Types.ObjectId, ref: 'User' })
    // senderId: Types.ObjectId;

    @Prop({ type: [String], unique: true })
    members: string[]
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
