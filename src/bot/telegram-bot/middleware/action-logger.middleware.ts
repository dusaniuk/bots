import { Middleware } from 'telegraf';
import { Chat, MessageEntity, User as TelegrafUser } from 'telegraf/typings/telegram-types';

import { Logger } from '../../../shared/logger';
import { AppContext } from '../../../shared/interfaces';

import { ChatType } from '../constants/chat-type';
import { MessageEntityType } from '../constants/message-entity-type';


class ActionLoggerMiddleware {
  private constructor(private ctx: AppContext) {}

  static logTriggeredAction = (ctx: AppContext, next: () => any): any => {
    const instance: ActionLoggerMiddleware = new ActionLoggerMiddleware(ctx);

    instance.checkAction();

    return next();
  };

  private checkAction = (): void => {
    if (this.isBotCommand()) {
      this.logTriggeredCommand();
    }
  };

  private isBotCommand = (): boolean => {
    const messageEntities = this.ctx.update.message?.entities ?? [];

    return messageEntities.some((entity: MessageEntity) => entity.type === MessageEntityType.BotCommand);
  };

  private logTriggeredCommand = (): void => {
    const triggeredCommand: string = this.getBotCommand();

    const displayableUser: string = this.getDisplayableUserString();
    const chatTitle: string = this.getChatTitle();

    Logger.info(`[more] ${triggeredCommand} is triggered by ${displayableUser}. Chat: ${chatTitle}`);
  };

  private getBotCommand = (): string => {
    const commandEntity: MessageEntity = this.ctx.update.message.entities.find((entity: MessageEntity) => {
      return entity.type === MessageEntityType.BotCommand;
    });

    return this.ctx.update.message.text.substring(commandEntity.offset, commandEntity.length);
  };


  private getDisplayableUserString = (): string => {
    const user: TelegrafUser = this.ctx.from;

    const stringifiedUser: string = user?.username ?? user?.first_name;
    return `${stringifiedUser} (id: ${user?.id})`;
  };

  private getChatTitle = (): string => {
    const chat: Chat = this.ctx.chat;

    const chatTitle: string = chat?.type === ChatType.private
      ? chat?.first_name : chat?.title;

    return `${chatTitle} (id: ${chat?.id})`;
  };
}


export const actionsLogger = (): Middleware<AppContext> => {
  return ActionLoggerMiddleware.logTriggeredAction;
};
