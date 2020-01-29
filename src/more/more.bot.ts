/* eslint-disable no-console */
import Telegraf, { session } from 'telegraf';
import { firestore } from 'firebase-admin';
import I18n from 'telegraf-i18n';
import { resolve } from 'path';

import { CONFIG } from '../config';
import { Bot } from '../shared/models/bot';

import { UtilsHandler } from './handlers/utils.handler';
import { CapturesHandler } from './handlers/captures.handler';

import { UsersHandler } from './handlers/users.handler';
import { AppContext } from '../shared/models/appContext';

export class MoreBot implements Bot {
  private readonly bot: Telegraf<AppContext>;

  private readonly usersHandler: UsersHandler;
  private readonly capturesHandler: CapturesHandler;
  private readonly utilsHandler: UtilsHandler;

  constructor(private db: firestore.Firestore) {
    this.bot = new Telegraf(CONFIG.more.botToken);

    this.utilsHandler = new UtilsHandler(this.db);
    this.usersHandler = new UsersHandler(this.db);
    this.capturesHandler = new CapturesHandler(this.db);
  }

  start = () => {
    const i18n = new I18n({
      defaultLanguage: 'ua',
      allowMissing: false,
      directory: resolve(__dirname, 'locales'),
    });

    this.bot.use(session());
    this.bot.use(i18n.middleware());

    this.bindUsersActions();
    this.bindCaptureActions();
    this.bindUtilActions();

    this.bot
      .launch()
      .then(() => console.log('more bot has been started'))
      .catch((err) => {
        console.error(err);
      });
  };

  private bindUsersActions = () => {
    this.bot.command('reg', this.usersHandler.register);
    this.bot.command('update', this.usersHandler.update);
    this.bot.command('score', this.usersHandler.getScore);
  };

  private bindCaptureActions = () => {
    this.bot.command('capture', this.capturesHandler.capture);
    this.bot.command('c', this.capturesHandler.capture);

    this.bot.on('callback_query', this.capturesHandler.handleHunterCapture);
  };

  private bindUtilActions = () => {
    this.bot.command('ping', this.utilsHandler.pong);
    this.bot.command(['help', 'halp'], this.utilsHandler.getHelp);
    this.bot.command('announce', this.utilsHandler.announce);
  };
}
