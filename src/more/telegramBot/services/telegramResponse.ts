import { injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { getApproveKeyboard } from '../keyboards/approve.keyboard';
import * as utils from '../utils/helpers';
import { Logger } from '../../../shared/logger';

import { CatchSummary, Mention } from '../../core/interfaces/catch';
import { User } from '../../core/interfaces/user';


@injectable()
export class TelegramResponse {
  deleteMessageFromAdminChat = async (ctx: AppContext): Promise<void> => {
    try {
      await ctx.deleteMessage();
    } catch (error) {
      Logger.error('[more] can\'t delete message from admin chat', error);
    }
  };

  notifyAdminAboutCatch = async (ctx: AppContext, catchSummary: CatchSummary): Promise<void> => {
    const keyboard = getApproveKeyboard(ctx, catchSummary.catchId);

    const hunter = utils.createUser(ctx.from);
    const messageData = this.getMessageData(hunter, catchSummary.victims);

    const summaryMessage: string = ctx.i18n.t('catch.summary', messageData);
    await ctx.telegram.sendMessage(catchSummary.admin.id, summaryMessage, keyboard);
  };

  notifyAdminAboutHandledCatch = async (ctx: AppContext): Promise<void> => {
    await ctx.answerCbQuery(ctx.i18n.t('other.handled'));
  };

  notifyChatAboutCatch = async (ctx: AppContext, catchSummary: CatchSummary): Promise<void> => {
    const hunter = utils.createUser(ctx.from);
    const messageData = this.getMessageData(hunter, catchSummary.victims);

    await ctx.replyWithMarkdown(ctx.i18n.t('catch.message', messageData));
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

  private getMessageData = (hunter: User, victims: User[]) => {
    return {
      hunter: utils.getGreetingNameForUser(hunter),
      victims: utils.getVictimsMsg(victims),
    };
  }
}
