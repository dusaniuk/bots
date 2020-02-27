import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';

import { ActionResult } from '../../core/models/action-result';
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
    this.replyService = new TelegramReplyService(ctx);

    await this.replyService.deleteMessageFromAdminChat();

    const { catchId, chatId } = this.getAdminDecisionFromContext(ctx);
    const result: ActionResult<CatchResult> = await this.catchController.rejectCatch(chatId, catchId);

    const { hunter }: CatchResult = result.payload;
    await this.replyService.sayAboutFailedCatch(chatId, hunter);

    await this.replyService.notifyAdminAboutHandledCatch();
  };

  private getAdminDecisionFromContext = (ctx: AppContext): CatchResultContextData => {
    const [, catchId, chatId] = ctx.callbackQuery.data.split(' ');

    return {
      chatId: +chatId,
      catchId,
    };
  };
}
