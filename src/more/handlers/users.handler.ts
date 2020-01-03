import { firestore } from 'firebase-admin';

import { UsersService } from '../service/users.service';
import { AppContext } from '../../shared/models/appContext';
import { ChatType } from '../models/chatType';
import { MoreFacesStickers } from '../constants/moreFaces.stickers';
import { Hunter } from '../models';
import * as utils from '../utils/helpers';

export class UsersHandler {
  private usersService: UsersService;

  constructor(private db: firestore.Firestore) {
    this.usersService = new UsersService(db);
  }

  register = async (ctx: AppContext): Promise<any> => {
    if (ctx.chat.type === ChatType.private) {
      return ctx.reply(ctx.i18n.t('error.rejectPrivate'));
    }

    const isUserInChat = await this.usersService.isUserInChat(ctx.chat.id, ctx.from.id);
    if (isUserInChat) {
      await ctx.reply(ctx.i18n.t('error.alreadyInGame'));
      return ctx.replyWithSticker(MoreFacesStickers.whatDoYouWant);
    }

    const hunter: Hunter = utils.createHunter(ctx);
    await this.usersService.addUserInChat(ctx.chat.id, hunter);

    return ctx.reply(
      ctx.i18n.t('user.greetNew', {
        user: utils.getGreetingNameForUser(hunter),
      }),
    );
  };

  getScore = async (ctx: AppContext): Promise<any> => {
    const hunters = await this.usersService.getAllUsersFromChat(ctx.chat.id);
    hunters.sort((a: Hunter, b: Hunter) => (b.score || 0) - (a.score || 0));

    return utils.getHuntersScore(ctx, hunters);
  };
}
