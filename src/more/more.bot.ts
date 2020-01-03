/* eslint-disable no-console */
import Telegraf, { ContextMessageUpdate, session } from 'telegraf';
import { firestore } from 'firebase-admin';
import I18n from 'telegraf-i18n';
import { resolve } from 'path';

import { CONFIG } from '../config';
import { Bot } from '../shared/bot';

import { FirestoreDatabase } from './database';
import { Database } from './interfaces/database';
import { ActionsHandler } from './bot/actionsHandler';

export class MoreBot implements Bot {
  private readonly bot: Telegraf<ContextMessageUpdate>;
  private readonly handler: ActionsHandler;
  private readonly usersDb: Database;

  constructor(private db: firestore.Firestore) {
    this.bot = new Telegraf(CONFIG.more.botToken);
    this.usersDb = new FirestoreDatabase(this.db);

    this.handler = new ActionsHandler(this.usersDb);
  }

  start = () => {
    const i18n = new I18n({
      defaultLanguage: 'ua',
      allowMissing: false,
      directory: resolve(__dirname, 'locales'),
    });

    this.bot.use(session());
    this.bot.use(i18n.middleware());

    this.bindPublicCommands();
    this.bindPrivateCommands();
    this.bindCallbackQueries();
    this.bindHears();

    this.bot
      .launch()
      .then(() => console.log('more bot has been started'))
      .catch((err) => {
        console.error(err);
      });
  };

  private bindPublicCommands = () => {
    this.bot.command('ping', this.handler.pong);
    this.bot.command('reg', this.handler.register);
    this.bot.command('score', this.handler.getScore);

    this.bot.command('help', this.handler.getHelp);
    this.bot.command('halp', this.handler.getHelp);

    this.bot.command('capture', this.handler.capture);
    this.bot.command('c', this.handler.capture);
  };

  private bindPrivateCommands = () => {
    this.bot.command('announce', this.handler.announce);
  };

  private bindCallbackQueries = () => {
    this.bot.on('callback_query', this.handler.handleAdminAnswer);
  };

  private bindHears = () => {
    this.bot.hears(/макс/i, this.handler.aveMaks);
  };
}
