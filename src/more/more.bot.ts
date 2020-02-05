/* eslint-disable no-console */
import Telegraf, { session } from 'telegraf';
import { inject, injectable } from 'inversify';
import I18n from 'telegraf-i18n';
import { resolve } from 'path';

import { CONFIG } from '../config';
import { Bot, AppContext } from '../shared/interfaces';

import { CatchHandler, UsersHandler, UtilsHandler } from './handlers';

@injectable()
export class MoreBot implements Bot {
  private readonly bot: Telegraf<AppContext>;

  constructor(
    @inject(UtilsHandler) private utilsHandler: UtilsHandler,
    @inject(UsersHandler) private usersHandler: UsersHandler,
    @inject(CatchHandler) private catchHandler: CatchHandler,
  ) {
    this.bot = new Telegraf(CONFIG.more.botToken);
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
