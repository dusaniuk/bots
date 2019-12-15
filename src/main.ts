import { Server } from './server';
import { CONFIG } from './config';
import { MoreBot } from './more/more.bot';
import { NbrBot } from './nbr/nbr.bot';

import { Bot } from './shared/bot';

const moreBot: Bot = new MoreBot();
const nbrBot: Bot = new NbrBot();

if (CONFIG.environment !== 'test') {
  nbrBot.start();
  // moreBot.start();

  const server: Server = new Server();
  server.run();
}
