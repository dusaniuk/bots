import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { Logger } from '../../../shared/logger';
import { TYPES } from '../../types';

import { Score } from '../../core/interfaces/user';
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
    try {
      this.replyService = new TelegramReplyService(ctx);
      this.tryToReplyWithScore(ctx.chat.id);
    } catch (error) {
      this.handleError(error);
    }
  };

  private tryToReplyWithScore = async (chatId: number): Promise<void> => {
    const score: Score = await this.scoreController.getSortedScoreForChat(chatId);

    await this.replyService.showHuntersScore(score);
  };

  private handleError = async (error: Error): Promise<void> => {
    Logger.error(error.message);

    await this.replyService.showUnexpectedError();
  };
}
