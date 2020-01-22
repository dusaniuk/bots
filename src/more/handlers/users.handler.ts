import { firestore } from 'firebase-admin';

import { UsersService } from '../service/users.service';
import { AppContext } from '../../shared/models/appContext';
import { ChatType } from '../models/chatType';
import { Hunter } from '../models';
import { createHunter, getGreetingNameForUser, getHuntersScore } from '../utils/helpers';

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
      return this.rejectRegistration(ctx);
    }

    return this.addNewUser(ctx);
  };

  getScore = async (ctx: AppContext): Promise<any> => {
    const hunters = await this.usersService.getAllUsersFromChat(ctx.chat.id);
    hunters.sort((a: Hunter, b: Hunter) => (b.score || 0) - (a.score || 0));

    return ctx.reply(
      ctx.i18n.t('user.score', {
        score: getHuntersScore(hunters),
        huntersCount: hunters.length,
      }),
    );
  };

  private rejectRegistration = async (ctx: AppContext): Promise<void> => {
    await ctx.reply(ctx.i18n.t('error.alreadyInGame'));
  };

  private addNewUser = async (ctx: AppContext): Promise<void> => {
    const hunter: Hunter = createHunter(ctx);
    await this.usersService.addUserInChat(ctx.chat.id, hunter);

    await ctx.reply(
      ctx.i18n.t('user.greetNew', {
        user: getGreetingNameForUser(hunter),
      }),
    );
  };
}
