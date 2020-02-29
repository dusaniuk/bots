import { injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { Logger } from '../../../shared/logger';

import { CatchSummary, Mention } from '../../core/interfaces/catch';
import { Score, User, UserWithScore } from '../../core/interfaces/user';

import * as utils from '../utils/helpers';
import { getApproveKeyboard } from '../keyboards/approve.keyboard';
import { BaseReplyService } from './reply-service/base-reply-service';


@injectable()
export class TelegramReplyService extends BaseReplyService {
  constructor(ctx: AppContext) {
    super(ctx);
  }

  deleteMessageFromAdminChat = async (): Promise<void> => {
    try {
      await this.deleteLastMessage();
    } catch (error) {
      Logger.error('[more] can\'t delete message from admin chat', error);
    }
  };

  notifyAdminAboutCatch = async (hunter: User, catchSummary: CatchSummary): Promise<void> => {
    await this.sendMessage(catchSummary.admin.id, 'catch.summary', {
      extra: getApproveKeyboard(this.ctx, catchSummary.catchId),
      templateData: {
        hunter: utils.getGreetingNameForUser(hunter),
        victims: this.getVictimsMsg(catchSummary.victims),
      },
    });
  };

  notifyAdminAboutHandledCatch = (): Promise<void> => {
    return this.answerCbQuery('other.handled');
  };

  notifyChatAboutCatch = async (hunter: User, catchSummary: CatchSummary): Promise<void> => {
    await this.reply('catch.message', {
      templateData: {
        hunter: utils.getGreetingNameForUser(hunter),
        victims: this.getVictimsMsg(catchSummary.victims),
      },
    });
  };

  rejectSelfCapture = (): Promise<void> => {
    return this.reply('error.selfCatch');
  };

  showCatchInstruction = (): Promise<void> => {
    return this.reply('other.howToCatch');
  };

  sayAboutSucceededCatch = async (chatId: number, hunter: User, earnedPoints: number): Promise<void> => {
    await this.sendMessage(chatId, 'catch.approved', {
      templateData: {
        user: utils.getGreetingNameForUser(hunter),
        points: earnedPoints,
      },
    });
  };

  sayAboutFailedCatch = async (chatId: number, hunter: User): Promise<void> => {
    await this.sendMessage(chatId, 'catch.rejected', {
      templateData: {
        user: utils.getGreetingNameForUser(hunter),
      },
    });
  };

  showUnverifiedMentions = async (mentions: Mention[]): Promise<void> => {
    let listedMentions = '';

    mentions.forEach((user: User) => {
      listedMentions += ` ${user.username}`;
    });

    await this.reply('error.nonRegisteredUsers', {
      templateData: {
        users: listedMentions.trim(),
      },
    });
  };

  greetNewHunter = async (hunter: User): Promise<void> => {
    await this.reply('user.greetNew', {
      templateData: {
        user: utils.getGreetingNameForUser(hunter),
      },
    });
  };

  rejectRegistrationInPrivateChat = async (): Promise<void> => {
    await this.reply('error.rejectPrivate');
  };

  showAlreadyInGameError = async (): Promise<void> => {
    await this.reply('error.alreadyInGame');
  };

  showUnexpectedError = async (): Promise<void> => {
    await this.reply('error.unexpected');
  };

  showGameRules = async (): Promise<void> => {
    await this.reply('other.rules');
  };

  greetBackOldHunter = async (): Promise<void> => {
    await this.reply('user.welcomeBack');
  };

  sayFarewellToLeftMember = async (leftMember: User): Promise<void> => {
    await this.reply('user.onLeft', {
      templateData: {
        user: utils.getGreetingNameForUser(leftMember),
      },
    });
  };

  showSuccessUpdate = async (): Promise<void> => {
    await this.reply('user.successUpdate');
  };

  showNotInGameError = async (): Promise<void> => {
    await this.reply('error.notInGame');
  };

  ping = async (): Promise<void> => {
    await this.reply('other.ping');
  };

  showHuntersScore = async (score: Score): Promise<void> => {
    await this.reply('user.score', {
      templateData: {
        score: this.getUsersScore(score),
      },
    });
  };

  private getUsersScore = (score: Score): string => {
    let msg = '';

    score
      .forEach((user: UserWithScore, index: number) => {
        let name = utils.getGreetingNameForUser(user.user);
        if (name.startsWith('@')) {
          name = name.substring(1);
        }

        msg += `\n${index + 1}) ${name}: ${user.points}`;
      });

    return msg;
  };

  private getVictimsMsg = (victims: User[]): string => {
    let message = '';

    victims.forEach((user) => {
      message += ` ${utils.getGreetingNameForUser(user)},`;
    });

    return message.substring(0, message.length - 1);
  };
}
