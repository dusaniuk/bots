import { Middleware } from 'telegraf';
import { MessageEntity } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../shared/interfaces';
import { CONFIG } from '../../config';

const filterNonPrivateChats = async (ctx: AppContext, next: () => any): Promise<{}> => {
  const messageEntities: MessageEntity[] = (ctx.message?.entities ?? []);
  const isCommand: boolean = messageEntities.some((entity: MessageEntity) => entity.type === 'bot_command');

  if (isCommand && ctx.chat.type !== 'private') {
    return ctx.reply(ctx.i18n.t('error.nonPrivateChat'));
  }

  return next();
};

const leaveNonWhitelistedChats = async (ctx: AppContext, next: () => any): Promise<{}> => {
  const whitelistedChats: number[] = CONFIG.nbr.whitelistedChats;

  if (ctx.chat.type === 'private' || whitelistedChats.includes(ctx.chat.id)) {
    return next();
  }

  console.log(`Leaving chat "${ctx.chat.title}"; ID: ${ctx.chat.id}`);

  try {
    await ctx.reply(ctx.i18n.t('error.forbiddenChat'));
  } catch (error) {
    console.log('Bot already was kicked out from the chat', error);
  }

  return ctx.leaveChat();
};

export const commandsInPrivateOnly = (): Middleware<AppContext> => filterNonPrivateChats;
export const checkChatAllowance = (): Middleware<AppContext> => leaveNonWhitelistedChats;
