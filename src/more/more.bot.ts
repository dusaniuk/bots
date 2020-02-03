/* eslint-disable no-console */
import Telegraf, { session } from 'telegraf';
import { firestore } from 'firebase-admin';
import I18n from 'telegraf-i18n';
import { resolve } from 'path';

import { CONFIG } from '../config';
import { Bot } from '../shared/models/bot';

import { UsersHandler } from './handlers/users.handler';
import { UtilsHandler } from './handlers/utils.handler';
import { CapturesHandler } from './handlers/captures.handler';

import { AppContext } from '../shared/models/appContext';
import { CapturesService } from './service/captures.service';
import { UsersService } from './service/users.service';

export class MoreBot implements Bot {
  private readonly bot: Telegraf<AppContext>;

  private readonly capturesService: CapturesService;
  private readonly usersService: UsersService;

  private readonly usersHandler: UsersHandler;
  private readonly capturesHandler: CapturesHandler;
  private readonly utilsHandler: UtilsHandler;

  constructor(private db: firestore.Firestore) {
    this.bot = new Telegraf(CONFIG.more.botToken);

    this.capturesService = new CapturesService(db);
    this.usersService = new UsersService(db);

    this.utilsHandler = new UtilsHandler(this.capturesService, this.usersService);
    this.usersHandler = new UsersHandler(this.usersService);
    this.capturesHandler = new CapturesHandler(this.capturesService, this.usersService);
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
      .catch(err => {
        console.error(err);
      });
  };

  private bindUsersActions = () => {
    this.bot.command('reg', this.usersHandler.register);
    this.bot.command('update', this.usersHandler.update);
    this.bot.command('score', this.usersHandler.getScore);

    this.bot.on('new_chat_members', this.usersHandler.onNewMemberInChat);
    this.bot.on('left_chat_member', this.usersHandler.onLeftChatMember);
  };

  private bindCaptureActions = () => {
    this.bot.command(['capture', 'c'], this.capturesHandler.capture);

    this.bot.on('callback_query', this.capturesHandler.handleUserCapture);
  };

  private bindUtilActions = () => {
    this.bot.command('ping', this.utilsHandler.pong);
    this.bot.command(['help', 'halp'], this.utilsHandler.getHelp);
    this.bot.command('announce', this.utilsHandler.announce);
  };
}
