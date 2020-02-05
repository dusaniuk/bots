import { Middleware } from 'telegraf';

import { AppContext } from '../../shared/interfaces/appContext';

const filterNonPrivateChats = async (ctx: AppContext, next: () => any): Promise<{}> => {
  const isCommand: boolean = ((ctx.message && ctx.message.entities) || []).some(entity => entity.type === 'bot_command');

  if (isCommand && ctx.chat.type !== 'private') {
    return ctx.reply(ctx.i18n.t('error.nonPrivateChat'));
  }

  return next();
};

export const commandsInPrivateOnly = (): Middleware<AppContext> => filterNonPrivateChats;
