import { inject, injectable } from 'inversify';

import { TYPES } from '../../types';
import { CatchHimselfError, NoCatchError, UnverifiedMentionsError } from '../errors';
import { CatchResult, CatchSummary, Mention } from '../interfaces/catch';
import { ICatchController } from '../interfaces/controllers';
import { UsersStore } from '../interfaces/store';

import { User } from '../interfaces/user';
import { CatchMentions } from '../models/catch-mentions';
import { CatchService, MentionsService } from '../service';


@injectable()
export class CatchController implements ICatchController {
  constructor(
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
    @inject(TYPES.CATCH_SERVICE) private catchService: CatchService,
    @inject(TYPES.MENTION_SERVICE) private mentionsService: MentionsService,
  ) { }

  approveCatch = (chatId: number, catchId: string): Promise<CatchResult> => {
    return this.catchService.approveCatch(chatId, catchId);
  };

  rejectCatch = (chatId: number, catchId: string): Promise<CatchResult> => {
    return this.catchService.rejectCatch(chatId, catchId);
  };

  registerVictimsCatch = async (chatId: number, hunterId: number, mentions: Mention[]): Promise<CatchSummary> => {
    const catchMentions: CatchMentions = await this.mentionsService.getMentionedUsersData(chatId, mentions);

    this.verifyCatch(chatId, hunterId, catchMentions);

    const catchId: string = await this.catchService.addCatchRecord(chatId, hunterId, catchMentions.victims);
    const admin: User = await this.usersStore.getAdminFromChat(chatId);

    return {
      admin,
      catchId,
      victims: catchMentions.victims,
      unverifiedMentions: catchMentions.unverifiedMentions,
    };
  };

  private verifyCatch = (chatId: number, hunterId: number, catchMentions: CatchMentions): void => {
    const errMessagePrefix = `[chatId: ${chatId}; hunterId: ${hunterId}]`;

    if (!catchMentions.hasAnyMentions) {
      throw new NoCatchError(`${errMessagePrefix} catch doesn't have any mentions`);
    }

    if (catchMentions.hasUnverifiedMentions) {
      const stringifiedUnverifiedUsers: string = JSON.stringify(catchMentions.unverifiedMentions);
      const message = `${errMessagePrefix} catch have a few unverified users ${stringifiedUnverifiedUsers}`;

      throw new UnverifiedMentionsError(message, catchMentions.unverifiedMentions);
    }

    const isCaptureHimself = catchMentions.victims.some((user: User) => user.id === hunterId);
    if (isCaptureHimself) {
      throw new CatchHimselfError(`${errMessagePrefix} hunter has caught himself`);
    }
  };
}
