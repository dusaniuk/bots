import { Message } from 'telegraf/typings/telegram-types';
import { firestore } from 'firebase-admin';

import { AppContext } from '../../shared/models/appContext';
import { MoreFacesStickers } from '../constants/moreFaces.stickers';
import { CapturesService } from '../service/captures.service';
import { UsersService } from '../service/users.service';

export class UtilsHandler {
  private capturesService: CapturesService;
  private usersService: UsersService;

  constructor(private db: firestore.Firestore) {
    this.capturesService = new CapturesService(db);
    this.usersService = new UsersService(db);
  }

  pong = (ctx: AppContext): Promise<Message> => {
    return ctx.reply(ctx.i18n.t('other.pong'));
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
