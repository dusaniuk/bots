import { inject, injectable } from 'inversify';

import { AppContext } from '../../shared/interfaces';

import { TYPES } from '../ioc/types';
import * as utils from '../utils/helpers';
import { Actions } from '../constants/actions';
import { CatchRecord, CatchStore, Mention, User, UsersStore } from '../interfaces';
import { getApproveKeyboard } from '../keyboards/approve.keyboard';


@injectable()
export class CatchHandler {
  constructor(
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
    @inject(TYPES.CATCH_STORE) private catchStore: CatchStore,
  ) {}

  catch = async (ctx: AppContext): Promise<any> => {
    const mentions: Mention[] = utils.getMentions(ctx.message);
    if (mentions.length === 0) {
      return ctx.reply(ctx.i18n.t('other.howToCatch'));
    }

    const chatUsers: User[] = await this.usersStore.getAllUsersFromChat(ctx.chat.id);
    const mentionedUsers = utils.getMentionedUsers(mentions, chatUsers);

    const isMentionedHimself: boolean = mentionedUsers.some((u: User) => u.id === ctx.from.id);
    if (isMentionedHimself) {
      return ctx.reply(ctx.i18n.t('error.selfCatch'));
    }

    const validUsers: User[] = [];
    const unverifiedUsers: User[] = [];

    mentionedUsers.forEach((user: User) => {
      // don't allow to push 2 same users
      if (validUsers.some((u: User) => u.id === user.id)) {
        return;
      }

      if (user.id) {
        validUsers.push(user);
        return;
      }

      unverifiedUsers.push(user);
    });

    if (unverifiedUsers.length > 0) {
      let users = '';

      unverifiedUsers.forEach((user: User) => {
        users += ` ${user.username}`;
      });

      await ctx.replyWithMarkdown(ctx.i18n.t('error.nonRegisteredUsers', { users }));
    }

    if (validUsers.length === 0) {
      return ctx.reply(ctx.i18n.t('error.noUsersToCatch'));
    }

    const catchId = await this.catchStore.addCatchRecord(ctx.chat.id, {
      approved: false,
      hunterId: ctx.from.id,
      timestamp: new Date().getTime(),
      victims: validUsers.filter((user: User) => user.id !== null).map((user: User) => user.id),
      points: validUsers.length * 4, // TODO: change this logic in future
    });

    const hunter: User = chatUsers.find(({ id }) => id === ctx.from.id);
    const adminId: number = chatUsers.find(({ isAdmin }: User) => isAdmin).id;

    const messageData = {
      hunter: utils.getGreetingNameForUser(hunter),
      victims: utils.getVictimsMsg(validUsers),
    };

    const keyboard = getApproveKeyboard(ctx, catchId);
    await ctx.telegram.sendMessage(adminId, ctx.i18n.t('catch.summary', messageData), keyboard);

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
