/* eslint-disable no-console */
import Telegraf, { session } from 'telegraf';
import { firestore } from 'firebase-admin';
import I18n from 'telegraf-i18n';
import { resolve } from 'path';

import { CONFIG } from '../config';
import { Bot } from '../shared/models/bot';

import { UsersHandler } from './handlers/users.handler';
import { UtilsHandler } from './handlers/utils.handler';
import { CatchHandler } from './handlers/catch.handler';

import { AppContext } from '../shared/models/appContext';
import { CatchStore } from './stores/catch.store';
import { UsersStore } from './stores/users.store';

export class MoreBot implements Bot {
  private readonly bot: Telegraf<AppContext>;

  private readonly catchStore: CatchStore;
  private readonly usersStore: UsersStore;

  private readonly usersHandler: UsersHandler;
  private readonly catchHandler: CatchHandler;
  private readonly utilsHandler: UtilsHandler;

  constructor(private db: firestore.Firestore) {
    this.bot = new Telegraf(CONFIG.more.botToken);

    this.catchStore = new CatchStore(db);
    this.usersStore = new UsersStore(db);

    this.utilsHandler = new UtilsHandler(this.catchStore, this.usersStore);
    this.usersHandler = new UsersHandler(this.usersStore);
    this.catchHandler = new CatchHandler(this.catchStore, this.usersStore);
  }

  start = (): void => {
    const i18n = new I18n({
      defaultLanguage: 'ua',
      allowMissing: false,
      directory: resolve(__dirname, 'locales'),
    });

    this.bot.use(session());
    this.bot.use(i18n.middleware());

    this.bindUsersActions();
    this.bindCatchActions();
    this.bindUtilActions();

    this.bot
      .launch()
      .then(() => console.log('more bot has been started'))
      .catch((err: Error) => {
        console.error(err);
      });
  };

  private bindUsersActions = (): void => {
    this.bot.command('reg', this.usersHandler.register);
    this.bot.command('update', this.usersHandler.update);
    this.bot.command('score', this.usersHandler.getScore);

    this.bot.on('new_chat_members', this.usersHandler.onNewMemberInChat);
    this.bot.on('left_chat_member', this.usersHandler.onLeftChatMember);
  };

  private bindCatchActions = (): void => {
    this.bot.command(['catch', 'c'], this.catchHandler.catch);

    this.bot.on('callback_query', this.catchHandler.handleUserCatch);
  };

  private bindUtilActions = (): void => {
    this.bot.command('ping', this.utilsHandler.pong);
    this.bot.command(['help', 'halp'], this.utilsHandler.getHelp);
    this.bot.command('announce', this.utilsHandler.announce);
  };
}
