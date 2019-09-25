/* eslint-disable no-console */
import Telegraf, { ContextMessageUpdate } from 'telegraf';

import { UsersDatabase } from './interfaces/users.database';
import { UsersService } from './services/users.service';
import { MessageService } from './services/message.service';

import { Server } from './utils/server';
import { ActionsHandler } from './bot';
import { CONFIG } from './config';

const main = () => {
  const usersDb: UsersDatabase = new UsersService();
  const messagesService: MessageService = new MessageService();

  const bot: Telegraf<ContextMessageUpdate> = new Telegraf(CONFIG.botToken);
  const handler = new ActionsHandler(usersDb, messagesService);

  bot.command('reg', handler.register);
  bot.command('capture', handler.capture);
  bot.command('score', handler.getScore);

  bot.on('callback_query', handler.handleAdminAnswer(bot));

  bot
    .launch()
    .then(() => console.log('bot has been started'))
    .catch(err => console.error(err));

  if (CONFIG.environment === 'dev') {
    console.log('suppress web server startup locally');
    return;
  }

  const server = new Server();
  server.run();
};

main();
