import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';

import { Score } from '../../core/interfaces/user';
import { IScoreController } from '../../core/interfaces/controllers';

import { BaseActionHandler } from './base/base-action-handler';


@injectable()
export class ScoreHandler extends BaseActionHandler {
  constructor(
    @inject(TYPES.SCORE_CONTROLLER) private scoreController: IScoreController,
  ) {
    super();
  }

  protected handleAction = async (ctx: AppContext): Promise<void> => {
    this.tryToReplyWithScore(ctx.chat.id);
  };

  private tryToReplyWithScore = async (chatId: number): Promise<void> => {
    const score: Score = await this.scoreController.getSortedScoreForChat(chatId);

    await this.replyService.showHuntersScore(score);
  };
}
