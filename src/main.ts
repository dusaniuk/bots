/* eslint-disable no-console */
import Telegraf, { ContextMessageUpdate } from 'telegraf';

import { Database } from './interfaces/database';
import { TelegrafResponseService } from './services/telegraf-response.service';

import { Server } from './utils/server';
import { ActionsHandler } from './bot/actions-handler';
import { CONFIG } from './config';
import { FirestoreDatabase } from './database';

const main = () => {
  const usersDb: Database = new FirestoreDatabase();
  const responseService: TelegrafResponseService = new TelegrafResponseService();

  const bot: Telegraf<ContextMessageUpdate> = new Telegraf(CONFIG.botToken);
  const handler = new ActionsHandler(usersDb, responseService);

  // commands for everyone
  bot.command('ping', handler.pong);
  bot.command('reg', handler.register);
  bot.command('score', handler.getScore);

  bot.command('help', handler.getHelp);
  bot.command('halp', handler.getHelp);

  bot.command('capture', handler.capture);
  bot.command('c', handler.capture);

  bot.on('callback_query', handler.handleAdminAnswer(bot));

  // admin commands
  bot.command('announce', handler.announce);

  // other
  bot.hears(/макс/i, handler.aveMaks);

  // TODO: switch bot to some kind of mock
  // so I don't need to to this if
  if (CONFIG.environment === 'test') {
    return;
  }

  bot
    .launch()
    .then(() => console.log('bot has been started'))
    .catch(err => console.error(err));

  const server: Server = new Server();
  server.run();
};

main();
