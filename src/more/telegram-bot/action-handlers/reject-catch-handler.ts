import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { Logger } from '../../../shared/logger';
import { TYPES } from '../../types';

import { ICatchController } from '../../core/interfaces/controllers';
import { CatchResultContextData, CatchResult } from '../../core/interfaces/catch';

import { ActionHandler } from '../interfaces/action-handler';
import { ContextParser, TelegramReplyService } from '../services';


@injectable()
export class RejectCatchHandler implements ActionHandler {
  private replyService: TelegramReplyService;

  constructor(
    @inject(TYPES.CONTEXT_PARSER) private parser: ContextParser,
    @inject(TYPES.CATCH_CONTROLLER) private catchController: ICatchController,
  ) {}

  handleAction = async (ctx: AppContext): Promise<any> => {
    try {
      this.replyService = new TelegramReplyService(ctx);
      const { catchId, chatId } = this.getCatchResultData(ctx);

      await this.tryToRejectCatch(catchId, chatId);
    } catch (error) {
      await this.handleActionError(error);
    }
  };

  private getCatchResultData = (ctx: AppContext): CatchResultContextData => {
    const [, catchId, chatId] = ctx.callbackQuery.data.split(' ');

    return {
      chatId: +chatId,
      catchId,
    };
  };

  private tryToRejectCatch = async (catchId: string, chatId: number): Promise<void> => {
    await this.replyService.deleteMessageFromAdminChat();

    const catchResult: CatchResult = await this.catchController.rejectCatch(chatId, catchId);

    await this.replyService.sayAboutFailedCatch(chatId, catchResult.hunter);

    await this.replyService.notifyAdminAboutHandledCatch();
  };

  private handleActionError = async (error: Error): Promise<void> => {
    Logger.error(error.message);

    await this.replyService.showUnexpectedError();
  };
}
