import { inject, injectable } from 'inversify';

import { AppContext } from '../../shared/interfaces';

import { TYPES } from '../ioc/types';
import { Actions } from '../constants/actions';
import { AdminDecision } from '../interfaces';
import { CatchService, MentionsService, TelegramResponse } from '../services';
import { CatchMentions } from '../models';


@injectable()
export class CatchHandler {
  constructor(
    @inject(TYPES.CATCH_SERVICE) private catchService: CatchService,
    @inject(TYPES.MENTION_SERVICE) private mentionsService: MentionsService,
    @inject(TYPES.TELEGRAM_RESPONSE) private telegramResponse: TelegramResponse,
  ) {}

  catch = async (ctx: AppContext): Promise<any> => {
    const mentionsData: CatchMentions = await this.mentionsService.getMentionsFromContext(ctx);

    if (!mentionsData.hasMentions) {
      return this.telegramResponse.showCatchInstruction(ctx);
    }

    if (mentionsData.isMentionedHimself) {
      return this.telegramResponse.rejectSelfCapture(ctx);
    }

    if (mentionsData.haveUnverifiedMentions) {
      await this.telegramResponse.showUnverifiedMentions(ctx, mentionsData.unverifiedMentions);
    }

    if (!mentionsData.haveVictims) {
      return this.telegramResponse.noUsersToCatch(ctx);
    }

    const catchId: string = await this.catchService.addCatchRecord(
      ctx.chat.id,
      mentionsData.hunter.id,
      mentionsData.victims,
    );

    return Promise.all([
      this.telegramResponse.notifyAdminAboutCatch(ctx, catchId, mentionsData),
      this.telegramResponse.notifyChatAboutCatch(ctx, mentionsData),
    ]);
  };

  approveCatch = async (ctx: AppContext): Promise<void> => {
    const { catchId, chatId } = this.getAdminDecisionFromContext(ctx);

    await this.telegramResponse.deleteMessageFromAdminChat(ctx);

    const { hunter, earnedPoints } = await this.catchService.approveCatch(chatId, catchId);
    await this.telegramResponse.sayAboutSucceededCatch(ctx, chatId, hunter, earnedPoints);

    await this.telegramResponse.notifyAdminAboutHandledCatch(ctx);
  };

  rejectCatch = async (ctx: AppContext): Promise<void> => {
    const { catchId, chatId } = this.getAdminDecisionFromContext(ctx);

    await this.telegramResponse.deleteMessageFromAdminChat(ctx);

    const { hunter } = await this.catchService.rejectCatch(chatId, catchId);
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