import Telegraf, { session } from 'telegraf';
import { inject, injectable } from 'inversify';
import I18n from 'telegraf-i18n';
import { resolve } from 'path';

import { CONFIG } from '../../config';
import { Logger } from '../../shared/logger';
import { Bot, AppContext } from '../../shared/interfaces';

import { Actions } from './constants/actions';
import { CatchHandler, UsersHandler, UtilsHandler } from './action-handlers';


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

    this.bindActionHandlersToCommands();
    this.bindActionHandlersToUpdateTypes();

    this.bot
      .launch()
      .then(() => Logger.info('[more] bot has been started'))
      .catch((err: Error) => {
        Logger.error('[more] bot has failed due to an error', err);
      });
  };

  private bindActionHandlersToCommands = (): void => {
    this.bot.command('reg', this.usersHandler.register);
    this.bot.command('update', this.usersHandler.update);
    this.bot.command('score', this.usersHandler.getScore);

    this.bot.command(['catch', 'c'], this.catchHandler.catch);
    this.bot.action(this.checkForAction(Actions.ApproveCatch), this.catchHandler.approveCatch);
    this.bot.action(this.checkForAction(Actions.RejectCatch), this.catchHandler.rejectCatch);

    this.bot.command('ping', this.utilsHandler.pong);
    this.bot.help(this.utilsHandler.getHelp);
  };

  private bindActionHandlersToUpdateTypes = (): void => {
    this.bot.on('new_chat_members', this.usersHandler.onNewMemberInChat);
    this.bot.on('left_chat_member', this.usersHandler.onLeftChatMember);
  };

  private checkForAction = (action: Actions) => {
    return (trigger: string): boolean => trigger.startsWith(action);
  };
}
