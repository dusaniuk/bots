import { User as TelegrafUser } from 'telegraf/typings/telegram-types';

import { UsersService } from '../service/users.service';
import { AppContext } from '../../shared/models/appContext';
import { ChatType } from '../constants/chatType';
import { User } from '../models';
import { createUser, getGreetingNameForUser, getUsersScore } from '../utils/helpers';

export class UsersHandler {
  constructor(private usersService: UsersService) {}

  register = async (ctx: AppContext): Promise<any> => {
    if (ctx.chat.type === ChatType.private) {
      return ctx.reply(ctx.i18n.t('error.rejectPrivate'));
    }

    const isUserInChat: boolean = await this.usersService.isUserInChat(ctx.chat.id, ctx.from.id);
    if (isUserInChat) {
      return ctx.reply(ctx.i18n.t('error.alreadyInGame'));
    }

    return this.addNewUser(ctx, createUser(ctx.from));
  };

  update = async (ctx: AppContext): Promise<any> => {
    const {
      from,
      chat: { id: chatId },
    }: AppContext = ctx;

    const isUserInChat: boolean = await this.usersService.isUserInChat(chatId, from.id);
    if (!isUserInChat) {
      return this.addNewUser(ctx, createUser(ctx.from));
    }

    await this.usersService.updateUser(chatId, from.id, {
      username: `@${from.username}`,
      firstName: from.first_name,
      lastName: from.last_name || null,
    });

    return ctx.reply(ctx.i18n.t('user.successUpdate'));
  };

  getScore = async (ctx: AppContext): Promise<any> => {
    const users = await this.usersService.getAllUsersFromChat(ctx.chat.id);
    users.sort((a: User, b: User) => (b.score || 0) - (a.score || 0));

    return ctx.reply(
      ctx.i18n.t('user.score', {
        score: getUsersScore(users),
        usersCount: users.length,
      }),
    );
  };

  onNewMemberInChat = async (ctx: AppContext): Promise<void> => {
    const newMembers: User[] = this.getNewMembers(ctx);

    for (const user of newMembers) {
      const isUserInChat = await this.usersService.isUserInChat(ctx.chat.id, user.id);

      if (isUserInChat) {
        await ctx.reply(ctx.i18n.t('user.welcomeBack'));
        await this.updateUserCatchability(ctx.chat.id, user.id, true);
      } else {
        await this.addNewUser(ctx, user);
      }
    }
  };

  onLeftChatMember = async (ctx: AppContext): Promise<any> => {
    const leftMember = createUser(ctx.message.left_chat_member);

    await this.updateUserCatchability(ctx.chat.id, leftMember.id, false);
    await ctx.reply(ctx.i18n.t('user.onLeft', {
      user: getGreetingNameForUser(leftMember),
    }));
  };

  private updateUserCatchability = async (chatId: number, userId: number, isCatchable: boolean): Promise<any> => {
    try {
      await this.usersService.updateUser(chatId, userId, {
        catchable: isCatchable,
      });
    } catch (error) {
      console.log(error);
    }
  };

  private getNewMembers = (ctx: AppContext): User[] => {
    const newUsers: TelegrafUser[] = (ctx.message?.new_chat_members ?? []).filter((user) => !user.is_bot);
    return newUsers.map(createUser);
  };

  private addNewUser = async (ctx: AppContext, user: User): Promise<void> => {
    await this.usersService.addUserInChat(ctx.chat.id, user);

    await ctx.reply(
      ctx.i18n.t('user.greetNew', {
        user: getGreetingNameForUser(user),
      }),
    );
  };
}
