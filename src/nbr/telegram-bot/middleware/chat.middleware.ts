import { Middleware } from 'telegraf';
import { MessageEntity } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../../shared/interfaces';

const filterNonPrivateChats = async (ctx: AppContext, next: () => any): Promise<{}> => {
  const messageEntities: MessageEntity[] = (ctx.message?.entities ?? []);
  const isCommand: boolean = messageEntities.some((entity: MessageEntity) => entity.type === 'bot_command');

  if (isCommand && ctx.chat.type !== 'private') {
    return ctx.reply(ctx.i18n.t('error.nonPrivateChat'));
  }

  return next();
};

export const commandsInPrivateOnly = (): Middleware<AppContext> => filterNonPrivateChats;
