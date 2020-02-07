import { inject, injectable } from 'inversify';

import { AppContext } from '../../shared/interfaces';

import { TYPES } from '../ioc/types';
import * as utils from '../utils/helpers';
import { Actions } from '../constants/actions';
import { CatchRecord, CatchStore, User, UsersStore } from '../interfaces';
import { getApproveKeyboard } from '../keyboards/approve.keyboard';
import { MentionsService } from '../services';

import { CatchMentions } from '../models';


@injectable()
export class CatchHandler {
  constructor(
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
    @inject(TYPES.CATCH_STORE) private catchStore: CatchStore,
    @inject(TYPES.MENTION_SERVICE) private mentionsService: MentionsService,
  ) {}

  catch = async (ctx: AppContext): Promise<any> => {
    const mentionsData: CatchMentions = await this.mentionsService.getMentionsFromContext(ctx);

    if (!mentionsData.hasMentions) {
      return ctx.reply(ctx.i18n.t('other.howToCatch'));
    }

    if (mentionsData.isMentionedHimself) {
      return ctx.reply(ctx.i18n.t('error.selfCatch'));
    }

    if (mentionsData.unverifiedMentions.length > 0) {
      let users = '';

      mentionsData.unverifiedMentions.forEach((user: User) => {
        users += ` ${user.username}`;
      });

      await ctx.replyWithMarkdown(ctx.i18n.t('error.nonRegisteredUsers', { users }));
    }

    if (mentionsData.victims.length === 0) {
      return ctx.reply(ctx.i18n.t('error.noUsersToCatch'));
    }

    const catchId = await this.catchStore.addCatchRecord(ctx.chat.id, {
      approved: false,
      hunterId: mentionsData.hunter.id,
      timestamp: new Date().getTime(),
      victims: mentionsData.victims.filter((user: User) => user.id !== null).map((user: User) => user.id),
      points: mentionsData.victims.length * 4, // TODO: change this logic in future
    });

    const messageData = {
      hunter: utils.getGreetingNameForUser(mentionsData.hunter),
      victims: utils.getVictimsMsg(mentionsData.victims),
    };

    const keyboard = getApproveKeyboard(ctx, catchId);
    await ctx.telegram.sendMessage(mentionsData.admin.id, ctx.i18n.t('catch.summary', messageData), keyboard);

    return ctx.replyWithMarkdown(ctx.i18n.t('catch.message', messageData));
  };

  handleUserCatch = async (ctx: AppContext): Promise<void> => {
    const [command, catchId, chatId] = ctx.callbackQuery.data.split(' ');

    // delete keyboard from admin's chat
    await ctx.deleteMessage();

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
