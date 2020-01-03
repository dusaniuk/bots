import { Middleware } from 'telegraf';

import { AppContext } from '../../shared/models/appContext';

const filterNonPrivateChats = async (ctx: AppContext, next: () => any): Promise<{}> => {
  if (ctx.chat.type !== 'private') {
    return ctx.reply(ctx.i18n.t('error.nonPrivateChat'));
  }

  return next();
};

export const onlyPrivate = (): Middleware<AppContext> => filterNonPrivateChats;
