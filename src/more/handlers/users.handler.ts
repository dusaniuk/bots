import { firestore } from 'firebase-admin';

import { UsersService } from '../service/users.service';
import { AppContext } from '../../shared/models/appContext';
import { ChatType } from '../models/chatType';
import { User } from '../models';
import { createUserFromContext, getGreetingNameForUser, getUsersScore } from '../utils/helpers';

export class UsersHandler {
  private usersService: UsersService;

  constructor(private db: firestore.Firestore) {
    this.usersService = new UsersService(db);
  }

  register = async (ctx: AppContext): Promise<any> => {
    if (ctx.chat.type === ChatType.private) {
      return ctx.reply(ctx.i18n.t('error.rejectPrivate'));
    }

    const isUserInChat: boolean = await this.usersService.isUserInChat(ctx.chat.id, ctx.from.id);
    if (isUserInChat) {
      return ctx.reply(ctx.i18n.t('error.alreadyInGame'));
    }

    return this.addNewUser(ctx);
  };

  update = async (ctx: AppContext): Promise<any> => {
    const {
      from,
      chat: { id: chatId },
    }: AppContext = ctx;

    const isUserInChat: boolean = await this.usersService.isUserInChat(chatId, from.id);
    if (!isUserInChat) {
      return this.addNewUser(ctx);
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

  private addNewUser = async (ctx: AppContext): Promise<void> => {
    const user: User = createUserFromContext(ctx);
    await this.usersService.addUserInChat(ctx.chat.id, user);

    await ctx.reply(
      ctx.i18n.t('user.greetNew', {
        user: getGreetingNameForUser(user),
      }),
    );
  };
}
