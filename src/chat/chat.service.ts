import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/UserSchema';
import * as mongoose from 'mongoose';
import { Conversation } from 'src/schemas/ConversationSchema';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { Message } from 'src/schemas/MessageSchema';
import { UpdateMessageDto } from './dto/UpdateMessage.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) { }

  async createConversation(senderId: string, reciverId: string) {
    if (senderId === reciverId) {
      throw new HttpException('Sender and receiver IDs should be different', 400);
    }

    const conversationExists = await this.conversationModel.exists({
      members: { $all: [senderId, reciverId] }
    });
    if (conversationExists) {
      throw new HttpException('Conversation already exists', 400);
    }


    const createConversation = new this.conversationModel({ members: [senderId, reciverId], });
    const savedConversation = await createConversation.save()
    return savedConversation
  }

  async getUserConversation(userId: string) {
    const conversation = await this.conversationModel.find({ members: { $in: userId } })
    return conversation
  }

  // create message
  async createMessage(createMessageDto: CreateMessageDto) {
    const message = new this.messageModel(createMessageDto);

    try {
      const savedMessage = await message.save()
      return savedMessage
    } catch (err) {
      throw new HttpException(err, 500)
    }
  }

  // delete conversation
  async deleteConversation(conversationId: string) {
    try {
      const conversation = await this.conversationModel.findByIdAndDelete(conversationId)
      return conversation
    } catch (err) {
      throw new HttpException(err, 500)
    }
  }

  // delete message 
  async deleteMessage(messageId: string) {
    try {
      const message = await this.messageModel.findByIdAndDelete(messageId)
      return message
    } catch (err) {
      throw new HttpException(err, 500)
    }
  }

  // update message
  async updateMessage(messageId: string, updateMessageDto: UpdateMessageDto) {
    try {
      const message = await this.messageModel.findByIdAndUpdate(messageId, updateMessageDto)
      return message
    } catch (err) {
      throw new HttpException(err, 500)
    }
  }


  // fetch conversations all messages
  async conversationAllMessages(conversationId: string) {
    try {
      const conversation = await this.messageModel.find({ conversationId: conversationId });
      return conversation
    } catch (err) {
      throw new HttpException(err, 500)
    }
  }
}



