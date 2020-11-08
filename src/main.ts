import 'reflect-metadata';

import { CONFIG } from './config';
import { Server } from './shared/server';
import { Bot } from './shared/interfaces';

import { container } from './inversify.config';

import { TYPES as MORE_TYPES } from './more/types';

if (CONFIG.environment !== 'test') {
  const bots: Bot[] = [
    container.get<Bot>(MORE_TYPES.MORE_BOT),
  ];

  bots.forEach((bot: Bot) => bot.start());

  const server: Server = new Server();
  server.run();
}
