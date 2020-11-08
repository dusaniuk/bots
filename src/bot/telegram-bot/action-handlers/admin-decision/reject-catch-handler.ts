import { inject, injectable } from 'inversify';

import { AppContext } from '../../../../shared/interfaces';
import { TYPES } from '../../../types';

import { ICatchController } from '../../../core/interfaces/controllers';
import { CatchResult } from '../../../core/interfaces/catch';

import { ContextParser } from '../../services';
import { BaseAdminCatchDecisionHandler } from './base-desition';


@injectable()
export class RejectCatchHandler extends BaseAdminCatchDecisionHandler {
  constructor(
    @inject(TYPES.CONTEXT_PARSER) private parser: ContextParser,
    @inject(TYPES.CATCH_CONTROLLER) private catchController: ICatchController,
  ) {
    super();
  }

  protected handleAction = async (ctx: AppContext): Promise<void> => {
    const { catchId, chatId } = this.getCatchDataFromCallbackQuery(ctx.callbackQuery);

    await this.rejectCatch(catchId, chatId);
  };

  private rejectCatch = async (catchId: string, chatId: number): Promise<void> => {
    await this.replyService.deleteMessageFromAdminChat();

    const catchResult: CatchResult = await this.catchController.rejectCatch(chatId, catchId);

    // TODO: move this in one function of reply service
    await this.replyService.sayAboutFailedCatch(chatId, catchResult.hunter);
    await this.replyService.notifyAdminAboutHandledCatch();
  };
}
