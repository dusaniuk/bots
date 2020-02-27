import Telegraf, { session } from 'telegraf';
import { inject, injectable } from 'inversify';
import I18n from 'telegraf-i18n';
import { resolve } from 'path';

import { CONFIG } from '../../config';
import { Logger } from '../../shared/logger';
import { AppContext, Bot } from '../../shared/interfaces';

import { Actions } from './constants/actions';
import { TYPES } from '../types';
import { ActionHandler } from './interfaces/action-handler';
import { actionsLogger } from './middleware/action-logger.middleware';


@injectable()
export class MoreBot implements Bot {
  private readonly bot: Telegraf<AppContext>;

  @inject(TYPES.REGISTER_HANDLER) private registerHandler: ActionHandler;
  @inject(TYPES.UPDATE_HANDLER) private updateHandler: ActionHandler;
  @inject(TYPES.SCORE_HANDLER) private scoreHandler: ActionHandler;
  @inject(TYPES.NEW_MEMBER_HANDLER) private newMemberHandler: ActionHandler;
  @inject(TYPES.LEFT_MEMBER_HANDLER) private leftMemberHandler: ActionHandler;

  @inject(TYPES.PING_HANDLER) private pingHandler: ActionHandler;
  @inject(TYPES.HELP_HANDLER) private helpHandler: ActionHandler;

  @inject(TYPES.CATCH_HANDLER) private catchHandler: ActionHandler;
  @inject(TYPES.APPROVE_CATCH_HANDLER) private approveCatchHandler: ActionHandler;
  @inject(TYPES.REJECT_CATCH_HANDLER) private rejectCatchHandler: ActionHandler;

  constructor() {
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
    this.bot.use(actionsLogger());

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
    this.bot.command(['reg', 'register'], this.registerHandler.handleAction);
    this.bot.command('update', this.updateHandler.handleAction);
    this.bot.command('score', this.scoreHandler.handleAction);

    this.bot.command(['catch', 'c'], this.catchHandler.handleAction);
    this.bot.action(this.checkForAction(Actions.ApproveCatch), this.approveCatchHandler.handleAction);
    this.bot.action(this.checkForAction(Actions.RejectCatch), this.rejectCatchHandler.handleAction);

    this.bot.command('ping', this.pingHandler.handleAction);
    this.bot.help(this.helpHandler.handleAction);
  };

  private bindActionHandlersToUpdateTypes = (): void => {
    this.bot.on('new_chat_members', this.newMemberHandler.handleAction);
    this.bot.on('left_chat_member', this.leftMemberHandler.handleAction);
  };

  private checkForAction = (action: Actions) => {
    return (trigger: string): boolean => trigger.startsWith(action);
  };
}
