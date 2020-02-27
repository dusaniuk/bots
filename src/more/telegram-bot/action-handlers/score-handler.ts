import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';

import { Score } from '../../core/interfaces/user';
import { ActionResult } from '../../core/models/action-result';
import { IScoreController } from '../../core/interfaces/controllers';

import { ActionHandler } from '../interfaces/action-handler';
import { TelegramReplyService } from '../services';


@injectable()
export class ScoreHandler implements ActionHandler {
  private replyService: TelegramReplyService;

  constructor(
    @inject(TYPES.SCORE_CONTROLLER) private scoreController: IScoreController,
  ) {}

  handleAction = async (ctx: AppContext): Promise<any> => {
    this.replyService = new TelegramReplyService(ctx);

    const result: ActionResult<Score> = await this.scoreController.getSortedScoreForChat(ctx.chat.id);

    if (result.ok) {
      await this.replyService.showHuntersScore(result.payload);
    }
  };
}
