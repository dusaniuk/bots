import { Message } from 'telegraf/typings/telegram-types';
import { firestore } from 'firebase-admin';

import { Hunter } from '../models';
import * as utils from '../utils/helpers';
import { ChatType } from '../models/chatType';
import { AppContext } from '../../shared/models/appContext';
import { MoreFacesStickers } from '../constants/moreFaces.stickers';
import { CapturesService } from '../service/captures.service';
import { UsersService } from '../service/users.service';

export class ActionsHandler {
  private capturesService: CapturesService;
  private usersService: UsersService;

  constructor(private db: firestore.Firestore) {
    this.capturesService = new CapturesService(db);
    this.usersService = new UsersService(db);
  }

  pong = (ctx: AppContext): Promise<Message> => {
    return ctx.reply(ctx.i18n.t('other.pong'));
  };

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

  getHelp = async (ctx: AppContext): Promise<void> => {
    await ctx.replyWithSticker(MoreFacesStickers.ohMyGod);

    await ctx.reply(ctx.i18n.t('other.rules'));
  };

  aveMaks = (ctx: AppContext): Promise<any> => {
    return ctx.reply(ctx.i18n.t('other.maks'));
  };

  announce = async (ctx: AppContext): Promise<void> => {
    if (ctx.message.from.id !== 288950149) {
      await ctx.reply(ctx.i18n.t('announce.secretCommand'));
      return;
    }

    const chatIDs = await this.usersService.getAllActiveChatsIDs();

    const botCommand = ctx.message.entities.find(entity => entity.type === 'bot_command');
    const message = ctx.message.text.substring(botCommand.length);

    await chatIDs.forEach((id: number) => ctx.telegram.sendMessage(id, message));

    await ctx.reply(ctx.i18n.t('announce.sentTo'));
  };
}
