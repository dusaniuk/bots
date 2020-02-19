import 'reflect-metadata';

import { CONFIG } from './config';
import { Server } from './shared/server';
import { container } from './shared/ioc';
import { Bot } from './shared/interfaces';

import { TYPES as NBR_TYPES } from './nbr/ioc/types';
import { TYPES as MORE_TYPES } from './more/types';

if (CONFIG.environment !== 'test') {
  const bots: Bot[] = [
    container.get<Bot>(MORE_TYPES.MORE_BOT),
    container.get<Bot>(NBR_TYPES.NBR_BOT),
  ];

  bots.forEach((bot: Bot) => bot.start());

  const server: Server = new Server();
  server.run();
}
