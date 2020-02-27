import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';
import { Logger } from '../../../shared/logger';

import { User } from '../../core/interfaces/user';
import { ActionResult } from '../../core/models/action-result';
import { CatchSummary, Mention } from '../../core/interfaces/catch';
import { ICatchController } from '../../core/interfaces/controllers';
import { CatchHimselfError, NoCatchError, UnverifiedMentionsError } from '../../core/errors';

import { ActionHandler } from '../interfaces/action-handler';
import { ContextParser, TelegramReplyService } from '../services';


@injectable()
export class CatchHandler implements ActionHandler {
  private telegramResponse: TelegramReplyService;

  constructor(
    @inject(TYPES.CONTEXT_PARSER) private parser: ContextParser,
    @inject(TYPES.CATCH_CONTROLLER) private catchController: ICatchController,
  ) {}


  handleAction = async (ctx: AppContext): Promise<any> => {
    this.telegramResponse = new TelegramReplyService(ctx);

    const { chat: { id: chatId }, from }: AppContext = ctx;
    const mentions: Mention[] = await this.parser.getMentionsFromContext(ctx);

    const result: ActionResult<CatchSummary> = await this.catchController.registerVictimsCatch(chatId, from.id, mentions);

    if (result.failed) {
      return this.handleCatchError(ctx, result.error);
    }

    const catchSummary: CatchSummary = result.payload;
    const hunter: User = this.parser.mapToUserEntity(from);

    return Promise.all([
      this.telegramResponse.notifyAdminAboutCatch(hunter, catchSummary),
      this.telegramResponse.notifyChatAboutCatch(hunter, catchSummary),
    ]);
  };

  private handleCatchError = async (ctx: AppContext, error: Error): Promise<void> => {
    Logger.error(error.message);

    if (error instanceof NoCatchError) {
      return this.telegramResponse.showCatchInstruction();
    }

    if (error instanceof CatchHimselfError) {
      return this.telegramResponse.rejectSelfCapture();
    }

    if (error instanceof UnverifiedMentionsError) {
      return this.telegramResponse.showUnverifiedMentions(error.unverifiedMentions);
    }

    return this.telegramResponse.showUnexpectedError();
  };
}
