import { firestore } from 'firebase-admin';

import { CapturesService } from '../service/captures.service';
import { AppContext } from '../../shared/models/appContext';
import {
  CaptureRecord, Hunter, Mention, User,
} from '../models';
import * as utils from '../utils/helpers';
import { getApproveKeyboard } from '../keyboards/approve.keyboard';
import { UsersService } from '../service/users.service';
import { Actions } from '../constants/actions';

export class CapturesHandler {
  private capturesService: CapturesService;
  private usersService: UsersService;

  constructor(private db: firestore.Firestore) {
    this.capturesService = new CapturesService(db);
    this.usersService = new UsersService(db);
  }

  capture = async (ctx: AppContext): Promise<any> => {
    const mentions: Mention[] = utils.getMentions(ctx.message);
    if (mentions.length === 0) {
      return ctx.reply(ctx.i18n.t('other.howToCapture'));
    }

    const chatUsers: Hunter[] = await this.usersService.getAllUsersFromChat(ctx.chat.id);
    const mentionedUsers = utils.getMentionedUsers(mentions, chatUsers);

    const isMentionedHimself: boolean = mentionedUsers.some(u => u.id === ctx.from.id);
    if (isMentionedHimself) {
      return ctx.reply(ctx.i18n.t('error.selfCapture'));
    }

    const validUsers: User[] = [];
    const unverifiedUsers: User[] = [];

    mentionedUsers.forEach((user: User) => {
      // don't allow to push 2 same users
      if (validUsers.some(u => u.id === user.id)) {
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

      unverifiedUsers.forEach((user) => {
        users += ` ${user.username}`;
      });

      await ctx.replyWithMarkdown(ctx.i18n.t('error.nonRegisteredUsers', { users }));
    }

    if (validUsers.length === 0) {
      return ctx.reply(ctx.i18n.t('error.noUsersToCapture'));
    }

    const captureId = await this.capturesService.addCaptureRecord(ctx.chat.id, {
      approved: false,
      hunterId: ctx.from.id,
      timestamp: new Date().getTime(),
      victims: validUsers.filter(user => user.id !== null).map(user => user.id),
      points: validUsers.length * 4, // TODO: change this logic in future
    });

    const hunter: User = chatUsers.find(({ id }) => id === ctx.from.id);
    const adminId: number = chatUsers.find(({ isAdmin }: Hunter) => isAdmin).id;

    const messageData = {
      hunter: utils.getGreetingNameForUser(hunter),
      victims: utils.getVictimsMsg(validUsers),
    };

    const keyboard = getApproveKeyboard(ctx, captureId);
    await ctx.telegram.sendMessage(adminId, ctx.i18n.t('capture.summary', messageData), keyboard);

    return ctx.replyWithMarkdown(ctx.i18n.t('capture.message', messageData));
  };

  handleHunterCapture = async (ctx: AppContext): Promise<void> => {
    const [command, captureId, chatId] = ctx.callbackQuery.data.split(' ');

    // delete keyboard from admin's chat
    await ctx.deleteMessage();

    // get record by capture id
    const record: CaptureRecord = await this.capturesService.getCaptureRecord(+chatId, captureId);
    const user = await this.usersService.getUserFromChat(record.hunterId, +chatId);

    if (command === Actions.ApproveCapture) {
      await this.capturesService.approveCaptureRecord(+chatId, captureId);

      // TODO: remove this 2 lines after I'll migrate to gathering score from capture records
      const newPoints = (user.score || 0) + record.points;
      await this.usersService.updateUserPoints(+chatId, record.hunterId, newPoints);
    }

    const msg = ctx.i18n.t(command, {
      user: utils.getGreetingNameForUser(user),
      points: record.points,
    });

    await ctx.telegram.sendMessage(chatId, msg);
    await ctx.answerCbQuery(ctx.i18n.t('other.handled'));
  };
}
