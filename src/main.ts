import { firestore } from 'firebase-admin';

import { Server } from './server';
import { CONFIG } from './config';
import { MoreBot } from './more/more.bot';
import { NbrBot } from './nbr/nbr.bot';

import { Bot } from './shared/models/bot';
import { createDatabase } from './shared/firestore.database';

const db: firestore.Firestore = createDatabase();

const moreBot: Bot = new MoreBot(db);
const nbrBot: Bot = new NbrBot(db);

if (CONFIG.environment !== 'test') {
  nbrBot.start();
  moreBot.start();

  const server: Server = new Server();
  server.run();
}
