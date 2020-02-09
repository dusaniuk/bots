import { inject, injectable } from 'inversify';

import { AppContext } from '../../shared/interfaces';

import { TYPES } from '../ioc/types';
import * as utils from '../utils/helpers';
import { Actions } from '../constants/actions';
import { CatchRecord, CatchStore, UsersStore } from '../interfaces';
import { CatchService, MentionsService, TelegramResponse } from '../services';
import { CatchMentions } from '../models';


@injectable()
export class CatchHandler {
  constructor(
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
    @inject(TYPES.CATCH_STORE) private catchStore: CatchStore,
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

  handleUserCatch = async (ctx: AppContext): Promise<void> => {
    const [command, catchId, chatId] = ctx.callbackQuery.data.split(' ');

    // delete keyboard from admin's chat
    try {
      await ctx.deleteMessage();
    } catch (error) {
      console.error('Can\t delete message from admin chat', error);
    }

    const catchRecord: CatchRecord = await this.catchStore.getCatchRecord(+chatId, catchId);
    const user = await this.usersStore.getUserFromChat(catchRecord.hunterId, +chatId);

    if (command === Actions.ApproveCatch) {
      await this.catchStore.approveCatch(+chatId, catchId);

      // TODO: remove this 2 lines after I'll migrate to gathering score from catch records
      const newPoints = (user.score || 0) + catchRecord.points;
      await this.usersStore.updateUserPoints(+chatId, catchRecord.hunterId, newPoints);
    }

    const msg = ctx.i18n.t(command, {
      user: utils.getGreetingNameForUser(user),
      points: catchRecord.points,
    });

    await ctx.telegram.sendMessage(chatId, msg);
    await ctx.answerCbQuery(ctx.i18n.t('other.handled'));
  };
}
