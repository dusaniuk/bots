import { injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { getApproveKeyboard } from '../keyboards/approve.keyboard';
import * as utils from '../utils/helpers';
import { Logger } from '../../../shared/logger';

import { CatchSummary, Mention } from '../../core/interfaces/catch';
import { Score, User } from '../../core/interfaces/user';


@injectable()
export class TelegramReplyService {
  constructor(private ctx: AppContext) { }


  deleteMessageFromAdminChat = async (): Promise<void> => {
    try {
      await this.ctx.deleteMessage();
    } catch (error) {
      Logger.error('[more] can\'t delete message from admin chat', error);
    }
  };

  notifyAdminAboutCatch = async (hunter: User, catchSummary: CatchSummary): Promise<void> => {
    const keyboard = getApproveKeyboard(this.ctx, catchSummary.catchId);

    const messageData = this.getMessageData(hunter, catchSummary.victims);

    const summaryMessage: string = this.ctx.i18n.t('catch.summary', messageData);
    await this.ctx.telegram.sendMessage(catchSummary.admin.id, summaryMessage, keyboard);
  };

  notifyAdminAboutHandledCatch = async (): Promise<void> => {
    await this.ctx.answerCbQuery(this.ctx.i18n.t('other.handled'));
  };

  notifyChatAboutCatch = async (hunter: User, catchSummary: CatchSummary): Promise<void> => {
    const messageData = this.getMessageData(hunter, catchSummary.victims);

    await this.ctx.replyWithMarkdown(this.ctx.i18n.t('catch.message', messageData));
  };

  rejectSelfCapture = async (): Promise<void> => {
    await this.ctx.reply(this.ctx.i18n.t('error.selfCatch'));
  };

  showCatchInstruction = async (): Promise<void> => {
    await this.ctx.reply(this.ctx.i18n.t('other.howToCatch'));
  };

  sayAboutSucceededCatch = async (chatId: number, hunter: User, earnedPoints: number): Promise<void> => {
    await this.ctx.telegram.sendMessage(chatId, this.ctx.i18n.t('catch.approved', {
      user: utils.getGreetingNameForUser(hunter),
      points: earnedPoints,
    }));
  };

  sayAboutFailedCatch = async (chatId: number, hunter: User): Promise<void> => {
    await this.ctx.telegram.sendMessage(chatId, this.ctx.i18n.t('catch.rejected', {
      user: utils.getGreetingNameForUser(hunter),
    }));
  };

  showUnverifiedMentions = async (mentions: Mention[]): Promise<void> => {
    let listedMentions = '';

    mentions.forEach((user: User) => {
      listedMentions += ` ${user.username}`;
    });

    await this.ctx.replyWithMarkdown(this.ctx.i18n.t('error.nonRegisteredUsers', {
      users: listedMentions.trim(),
    }));
  };

  greetNewHunter = async (hunter: User): Promise<void> => {
    await this.ctx.reply(
      this.ctx.i18n.t('user.greetNew', {
        user: utils.getGreetingNameForUser(hunter),
      }),
    );
  };

  rejectRegistrationInPrivateChat = async (): Promise<void> => {
    await this.ctx.reply(this.ctx.i18n.t('error.rejectPrivate'));
  };

  showAlreadyInGameError = async (): Promise<void> => {
    await this.ctx.reply(this.ctx.i18n.t('error.alreadyInGame'));
  };

  showUnexpectedError = async (): Promise<void> => {
    await this.ctx.reply(this.ctx.i18n.t('error.unexpected'));
  };

  showGameRules = async (): Promise<void> => {
    await this.ctx.replyWithMarkdown(this.ctx.i18n.t('other.rules'));
  };

  greetBackOldHunter = async (): Promise<void> => {
    await this.ctx.reply(this.ctx.i18n.t('user.welcomeBack'));
  };

  sayFarewellToLeftMember = async (leftMember: User): Promise<void> => {
    await this.ctx.reply(this.ctx.i18n.t('user.onLeft', {
      user: utils.getGreetingNameForUser(leftMember),
    }));
  };

  showSuccessUpdate = async (): Promise<void> => {
    await this.ctx.reply(this.ctx.i18n.t('user.successUpdate'));
  };

  showNotInGameError = async (): Promise<void> => {
    await this.ctx.reply(this.ctx.i18n.t('error.notInGame'));
  };

  ping = async (): Promise<void> => {
    await this.ctx.reply(this.ctx.i18n.t('other.ping'));
  };

  showHuntersScore = async (score: Score): Promise<void> => {
    await this.ctx.reply(
      this.ctx.i18n.t('user.score', {
        score: utils.getUsersScore(score),
      }),
    );
  };

  private getMessageData = (hunter: User, victims: User[]) => {
    return {
      hunter: utils.getGreetingNameForUser(hunter),
      victims: utils.getVictimsMsg(victims),
    };
  }
}
