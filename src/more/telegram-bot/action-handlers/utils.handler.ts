import { Message } from 'telegraf/typings/telegram-types';
import { injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';


@injectable()
export class UtilsHandler {
  pong = (ctx: AppContext): Promise<Message> => {
    return ctx.reply(ctx.i18n.t('other.pong'));
  };

  getHelp = async (ctx: AppContext): Promise<void> => {
    await ctx.replyWithMarkdown(ctx.i18n.t('other.rules'));
  };
}
