import Telegraf, { ContextMessageUpdate } from 'telegraf';

import CONFIG from './config';
import { Hunter } from './models/hunter.model';
import { createHunter, getHunterName } from './utils';
import { UsersDatabase } from './interfaces/users.database';
import { UsersService } from './services/users.service';

const bot = new Telegraf(CONFIG.botToken);

const usersDb: UsersDatabase = new UsersService();

bot.command('reg', async (ctx: ContextMessageUpdate) => {
  const isUserInChat = await usersDb.isUserInChat(ctx.from.id, ctx.chat.id);
  if (isUserInChat) {
    return ctx.reply("Hey, you're already in the game!");
  }

  const hunter: Hunter = createHunter(ctx);
  await usersDb.addUserInChat(hunter, ctx.chat.id);

  const response = getHunterName(hunter);

  return ctx.reply(`Welcome, ${response}. Fight for your points!`);
});

bot.launch();
