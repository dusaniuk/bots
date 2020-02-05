import { Message, MessageEntity } from 'telegraf/typings/telegram-types';
import { inject, injectable } from 'inversify';

import { AppContext } from '../../shared/interfaces';

import { TYPES } from '../ioc/types';
import { CatchStore, UsersStore } from '../interfaces';


@injectable()
export class UtilsHandler {
  constructor(
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
    @inject(TYPES.CATCH_STORE) private catchStore: CatchStore,
  ) {}

  pong = (ctx: AppContext): Promise<Message> => {
    return ctx.reply(ctx.i18n.t('other.pong'));
  };

  getHelp = async (ctx: AppContext): Promise<void> => {
    await ctx.replyWithMarkdown(ctx.i18n.t('other.rules'));
  };

  announce = async (ctx: AppContext): Promise<void> => {
    if (ctx.message.from.id !== 288950149) {
      await ctx.reply(ctx.i18n.t('announce.secretCommand'));
      return;
    }

    const chatIDs = await this.usersStore.getAllActiveChatsIDs();

    const botCommand = ctx.message.entities.find((entity: MessageEntity) => entity.type === 'bot_command');
    const message = ctx.message.text.substring(botCommand.length);

    await chatIDs.forEach((id: number) => ctx.telegram.sendMessage(id, message));

    await ctx.reply(ctx.i18n.t('announce.sentTo'));
  };
}
