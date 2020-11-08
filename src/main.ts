import 'reflect-metadata';

import { CONFIG } from './config';
import { Server } from './shared/server';
import { Bot } from './shared/interfaces';

import { container } from './inversify.config';

import { TYPES as MORE_TYPES } from './bot/types';

if (CONFIG.environment !== 'test') {
  const bot: Bot = container.get<Bot>(MORE_TYPES.MORE_BOT);
  bot.start();

  const server: Server = new Server();
  server.run();
}
