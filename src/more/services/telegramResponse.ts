import { injectable } from 'inversify';

import { AppContext } from '../../shared/interfaces';
import { Mention, User } from '../interfaces';
import { getApproveKeyboard } from '../keyboards/approve.keyboard';
import { CatchMentions } from '../models';
import * as utils from '../utils/helpers';

@injectable()
export class TelegramResponse {
  notifyAdminAboutCatch = async (ctx: AppContext, catchId: string, mentionsData: CatchMentions): Promise<void> => {
    const keyboard = getApproveKeyboard(ctx, catchId);

    const summaryMessage: string = ctx.i18n.t('catch.summary', this.getMessageData(mentionsData));
    await ctx.telegram.sendMessage(mentionsData.admin.id, summaryMessage, keyboard);
  };

  notifyAdminAboutHandledCatch = async (ctx: AppContext): Promise<void> => {
    await ctx.answerCbQuery(ctx.i18n.t('other.handled'));
  };

  notifyChatAboutCatch = async (ctx: AppContext, mentionsData: CatchMentions): Promise<void> => {
    await ctx.replyWithMarkdown(ctx.i18n.t('catch.message', this.getMessageData(mentionsData)));
  };

  noUsersToCatch = async (ctx: AppContext): Promise<void> => {
    await ctx.reply(ctx.i18n.t('error.noUsersToCatch'));
  };

  rejectSelfCapture = async (ctx: AppContext): Promise<void> => {
    await ctx.reply(ctx.i18n.t('error.selfCatch'));
  };

  showCatchInstruction = async (ctx: AppContext): Promise<void> => {
    await ctx.reply(ctx.i18n.t('other.howToCatch'));
  };

  sayAboutSucceededCatch = async (ctx: AppContext, chatId: number, hunter: User, earnedPoints: number): Promise<void> => {
    await ctx.telegram.sendMessage(chatId, ctx.i18n.t('catch.approved', {
      user: utils.getGreetingNameForUser(hunter),
      points: earnedPoints,
    }));
  };

  sayAboutFailedCatch = async (ctx: AppContext, chatId: number, hunter: User): Promise<void> => {
    await ctx.telegram.sendMessage(chatId, ctx.i18n.t('catch.rejected', {
      user: utils.getGreetingNameForUser(hunter),
    }));
  };

  showUnverifiedMentions = async (ctx: AppContext, mentions: Mention[]): Promise<void> => {
    let listedMentions = '';

    mentions.forEach((user: User) => {
      listedMentions += ` ${user.username}`;
    });

    await ctx.replyWithMarkdown(ctx.i18n.t('error.nonRegisteredUsers', {
      users: listedMentions.trim(),
    }));
  };

  private getMessageData = (mentionsData: CatchMentions) => {
    return {
      hunter: utils.getGreetingNameForUser(mentionsData.hunter),
      victims: utils.getVictimsMsg(mentionsData.victims),
    };
  }
}
