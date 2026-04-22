import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Dashboard } from '../dashboard/entities/dashboard.entity';
import { CreateChatMessageDto, UpdateChatDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
    @InjectRepository(Dashboard)
    private dashboardRepository: Repository<Dashboard>,
  ) {}

  async findAllByUser(userId: string): Promise<Chat[]> {
    const dashboards = await this.dashboardRepository.find({
      where: { userId },
      relations: ['chat', 'chat.messages'],
      order: { createdAt: 'DESC' },
    });
    
    return dashboards
      .filter(d => d.chat)
      .map(d => d.chat);
  }

  async findOneById(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['messages', 'dashboard'],
    });
    
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    
    if (chat.dashboard?.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    
    return chat;
  }

  async findOrCreateByUser(userId: string, createDto: CreateChatMessageDto): Promise<{ chat: Chat; message: ChatMessage; isNewDashboard: boolean }> {
    const dashboards = await this.dashboardRepository.find({
      where: { userId },
      relations: ['chat'],
      order: { createdAt: 'DESC' },
      take: 1,
    });

    let chat: Chat;
    let isNewDashboard = false;

    if (dashboards.length === 0) {
      const dashboard = this.dashboardRepository.create({
        name: `Dashboard ${new Date().toLocaleDateString()}`,
        description: '',
        userId,
        data: {},
      });
      const savedDashboard = await this.dashboardRepository.save(dashboard);

      chat = this.chatRepository.create({
        dashboardId: savedDashboard.id,
      });
      await this.chatRepository.save(chat);
      isNewDashboard = true;
    } else {
      chat = dashboards[0].chat;
      if (!chat) {
        chat = this.chatRepository.create({
          dashboardId: dashboards[0].id,
        });
        await this.chatRepository.save(chat);
      }
    }

    const maxOrder = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId: chat.id })
      .select('MAX(message.order)', 'max')
      .getRawOne();

    const message = this.messageRepository.create({
      ...createDto,
      chatId: chat.id,
      order: (maxOrder?.max ?? -1) + 1,
    });
    const savedMessage = await this.messageRepository.save(message);

    return { chat, message: savedMessage, isNewDashboard };
  }

  async findOneByDashboard(dashboardId: string, userId: string): Promise<Chat> {
    const dashboard = await this.dashboardRepository.findOne({
      where: { id: dashboardId },
    });
    if (!dashboard || dashboard.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    let chat = await this.chatRepository.findOne({
      where: { dashboardId },
      relations: ['messages'],
    });
    
    if (!chat) {
      chat = this.chatRepository.create({ dashboardId });
      chat = await this.chatRepository.save(chat);
    }
    return chat;
  }

  async addMessage(
    dashboardId: string,
    userId: string,
    createDto: CreateChatMessageDto,
  ): Promise<ChatMessage> {
    console.log('addMessage called:', { dashboardId, userId, createDto });
    const chat = await this.findOneByDashboard(dashboardId, userId);
    console.log('Chat found:', chat.id);

    const maxOrder = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId: chat.id })
      .select('MAX(message.order)', 'max')
      .getRawOne();

    const message = this.messageRepository.create({
      ...createDto,
      chatId: chat.id,
      order: (maxOrder?.max ?? -1) + 1,
    });
    const savedMessage = await this.messageRepository.save(message);
    console.log('Message saved:', savedMessage.id);
    return savedMessage;
  }

  async getMessages(dashboardId: string, userId: string): Promise<ChatMessage[]> {
    console.log('getMessages called:', { dashboardId, userId });
    const chat = await this.findOneByDashboard(dashboardId, userId);
    console.log('Chat for messages:', chat.id);
    const messages = this.messageRepository.find({
      where: { chatId: chat.id },
      order: { order: 'ASC' },
    });
    console.log('Messages found:', (await messages).length);
    return messages;
  }

  private async getChatId(dashboardId: string): Promise<string> {
    const chat = await this.chatRepository.findOne({
      where: { dashboardId },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return chat.id;
  }

  async clearMessages(dashboardId: string, userId: string): Promise<void> {
    const chat = await this.findOneByDashboard(dashboardId, userId);
    await this.messageRepository.delete({ chatId: chat.id });
  }

  async updateTitle(
    dashboardId: string,
    userId: string,
    updateDto: UpdateChatDto,
  ): Promise<Chat> {
    const chat = await this.findOneByDashboard(dashboardId, userId);
    Object.assign(chat, updateDto);
    return this.chatRepository.save(chat);
  }
}
