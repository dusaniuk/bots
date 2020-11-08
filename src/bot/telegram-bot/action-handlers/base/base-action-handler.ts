import { injectable } from 'inversify';

import { AppContext } from '../../../../shared/interfaces';
import { Logger } from '../../../../shared/logger';

import {
  AlreadyInGameError,
  CatchHimselfError,
  NoCatchError,
  NotInGameError,
  UnverifiedMentionsError
} from '../../../core/errors';
import { ActionHandler } from '../../interfaces/action-handler';
import { TelegramReplyService } from '../../services';

@injectable()
export abstract class BaseActionHandler implements ActionHandler {
  protected replyService: TelegramReplyService;

  execute = async (ctx: AppContext): Promise<any> => {
    this.replyService = new TelegramReplyService(ctx);

    try {
      await this.handleAction(ctx);
    } catch (error) {
      await this.handleError(error);
    }
  };

  protected abstract handleAction(ctx: AppContext): Promise<void>;

  protected handleError = async (error): Promise<void> => {
    Logger.error(error.message);

    if (error instanceof NoCatchError) {
      return this.replyService.showCatchInstruction();
    }

    if (error instanceof CatchHimselfError) {
      return this.replyService.rejectSelfCapture();
    }

    if (error instanceof UnverifiedMentionsError) {
      return this.replyService.showUnverifiedMentions(error.unverifiedMentions);
    }

    if (error instanceof AlreadyInGameError) {
      return this.replyService.showAlreadyInGameError();
    }

    if (error instanceof NotInGameError) {
      return this.replyService.showNotInGameError();
    }

    return this.replyService.showUnexpectedError();
  };
}
