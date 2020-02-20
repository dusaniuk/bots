import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { Logger } from '../../../shared/logger';
import { TYPES } from '../../types';

import { User } from '../../core/interfaces/user';
import { ActionResult } from '../../core/models/action-result';
import { ICatchController } from '../../core/interfaces/controllers';
import { CatchHimselfError, NoCatchError, UnverifiedMentionsError } from '../../core/errors';
import {
  AdminDecision,
  CatchResult,
  CatchSummary,
  Mention,
} from '../../core/interfaces/catch';

import { Actions } from '../constants/actions';
import { ContextParser, TelegramResponse } from '../services';


@injectable()
export class CatchHandler {
  constructor(
    @inject(TYPES.CONTEXT_PARSER) private parser: ContextParser,
    @inject(TYPES.TELEGRAM_RESPONSE) private telegramResponse: TelegramResponse,
    @inject(TYPES.CATCH_CONTROLLER) private catchController: ICatchController,
  ) {}

  catch = async (ctx: AppContext): Promise<any> => {
    const mentions: Mention[] = await this.parser.getMentionsFromContext(ctx);
    const result: ActionResult<CatchSummary> = await this.catchController.registerVictimsCatch(ctx.chat.id, ctx.from.id, mentions);

    if (result.ok) {
      const catchSummary: CatchSummary = result.payload;
      const hunter: User = this.parser.mapToUserEntity(ctx.from);

      return Promise.all([
        this.telegramResponse.notifyAdminAboutCatch(ctx, hunter, catchSummary),
        this.telegramResponse.notifyChatAboutCatch(ctx, hunter, catchSummary),
      ]);
    }

    Logger.error(result.error.message);

    if (result.error instanceof NoCatchError) {
      return this.telegramResponse.showCatchInstruction(ctx);
    }

    if (result.error instanceof CatchHimselfError) {
      return this.telegramResponse.rejectSelfCapture(ctx);
    }

    if (result.error instanceof UnverifiedMentionsError) {
      return this.telegramResponse.showUnverifiedMentions(ctx, result.error.unverifiedMentions);
    }

    return ctx.reply('Something bad has happened');
  };

  approveCatch = async (ctx: AppContext): Promise<void> => {
    const { catchId, chatId } = this.getAdminDecisionFromContext(ctx);

    await this.telegramResponse.deleteMessageFromAdminChat(ctx);

    const result: ActionResult<CatchResult> = await this.catchController.approveCatch(chatId, catchId);

    const { hunter, earnedPoints } = result.payload;
    await this.telegramResponse.sayAboutSucceededCatch(ctx, chatId, hunter, earnedPoints);

    await this.telegramResponse.notifyAdminAboutHandledCatch(ctx);
  };

  rejectCatch = async (ctx: AppContext): Promise<void> => {
    const { catchId, chatId } = this.getAdminDecisionFromContext(ctx);

    await this.telegramResponse.deleteMessageFromAdminChat(ctx);

    const result: ActionResult<CatchResult> = await this.catchController.rejectCatch(chatId, catchId);

    const { hunter } = result.payload;
    await this.telegramResponse.sayAboutFailedCatch(ctx, chatId, hunter);

    await this.telegramResponse.notifyAdminAboutHandledCatch(ctx);
  };

  private getAdminDecisionFromContext = (ctx: AppContext): AdminDecision => {
    const [command, catchId, chatId] = ctx.callbackQuery.data.split(' ');

    return {
      action: command as Actions,
      chatId: +chatId,
      catchId,
    };
  };
}
