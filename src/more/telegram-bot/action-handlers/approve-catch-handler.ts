import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';

import { ActionResult } from '../../core/models/action-result';
import { ICatchController } from '../../core/interfaces/controllers';
import { CatchResultContextData, CatchResult } from '../../core/interfaces/catch';

import { ActionHandler } from '../interfaces/action-handler';
import { ContextParser, TelegramReplyService } from '../services';


@injectable()
export class ApproveCatchHandler implements ActionHandler {
  private replyService: TelegramReplyService;

  constructor(
    @inject(TYPES.CONTEXT_PARSER) private parser: ContextParser,
    @inject(TYPES.CATCH_CONTROLLER) private catchController: ICatchController,
  ) {}

  handleAction = async (ctx: AppContext): Promise<any> => {
    this.replyService = new TelegramReplyService(ctx);

    await this.replyService.deleteMessageFromAdminChat();

    const { catchId, chatId } = this.getCatchResultData(ctx);
    const result: ActionResult<CatchResult> = await this.catchController.approveCatch(chatId, catchId);

    const { hunter, earnedPoints }: CatchResult = result.payload;
    await this.replyService.sayAboutSucceededCatch(chatId, hunter, earnedPoints);

    await this.replyService.notifyAdminAboutHandledCatch();
  };

  private getCatchResultData = (ctx: AppContext): CatchResultContextData => {
    const [, catchId, chatId] = ctx.callbackQuery.data.split(' ');

    return {
      chatId: +chatId,
      catchId,
    };
  };
}
