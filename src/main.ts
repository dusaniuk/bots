import { Server } from './server';
import { CONFIG } from './config';
import { MoreBot } from './more/more.bot';

const moreBot = new MoreBot();

if (CONFIG.environment !== 'test') {
  moreBot.start();

  const server: Server = new Server();
  server.run();
}
