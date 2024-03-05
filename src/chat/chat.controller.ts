import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { UpdateMessageDto } from './dto/UpdateMessage.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  // create conversation
  @Post('/conversation')
  async createConversation(@Body() conversationContent) {
    const senderId = conversationContent.senderId;
    const reciverId = conversationContent.reciverId;

    const conversation = this.chatService.createConversation(senderId, reciverId)
    return conversation
  }

  // get user conversation
  @Get('/conversation/:userId')
  async getUserConversation(@Param('userId') userId: string) {
    const conversation = this.chatService.getUserConversation(userId)
    return conversation
  }

  // Create Message 
  @Post('/conversation/message')
  async createMessage(@Body() createMessage: CreateMessageDto) {
    const message = this.chatService.createMessage(createMessage)
    return message
  }

  // get conversations all messages
  @Get('/conversation/messages/:conversationId')
  async conversationAllMessages(@Param('conversationId') conversationId: string) {
    const conversation = this.chatService.conversationAllMessages(conversationId);
    return conversation
  }

  // delete conversation 
  @Delete('/conversation/:conversationId')
  async deleteConversation(@Param('conversationId') conversationId: string) {
    await this.chatService.deleteConversation(conversationId);
    return 'Conversation has been deleted'
  }

  // delete message 
  @Delete('/conversation/message/:messageId')
  async deleteMessage(@Param('messageId') messageId: string) {
    await this.chatService.deleteMessage(messageId);
    return 'Message has been deleted'
  }

  // update message
  @Patch('/conversation/message/:messageId')
  async updateMessage(@Param('messageId') messageId: string, @Body() updateMessageDto: UpdateMessageDto) {
    await this.chatService.updateMessage(messageId, updateMessageDto);
    return 'Message has been updated'
  }

}
