/* eslint-disable no-console */
import Telegraf, { ContextMessageUpdate } from 'telegraf';

import { UsersDatabase } from './interfaces/users.database';
import { UsersService } from './services/users.service';
import { TelegrafResponseService } from './services/telegraf-response.service';

import { Server } from './utils/server';
import { ActionsHandler } from './actions-handler';
import { CONFIG } from './config';

const main = () => {
  const usersDb: UsersDatabase = new UsersService();
  const responseService: TelegrafResponseService = new TelegrafResponseService();

  const bot: Telegraf<ContextMessageUpdate> = new Telegraf(CONFIG.botToken);
  const handler = new ActionsHandler(usersDb, responseService);

  bot.use(handler.middleware.verifyChatType);

  bot.command('reg', handler.register);
  bot.command('capture', handler.capture);
  bot.command('c', handler.capture);
  bot.command('score', handler.getScore);

  bot.on('callback_query', handler.handleAdminAnswer(bot));

  // TODO: switch bot to some kind of mock
  // so I don't need to to this if
  if (CONFIG.environment === 'test') {
    return;
  }

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
