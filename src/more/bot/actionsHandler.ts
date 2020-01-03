import { Message } from 'telegraf/typings/telegram-types';
import { firestore } from 'firebase-admin';

import {
  CaptureRecord, Hunter, Mention, User,
} from '../models';
import * as utils from '../utils/helpers';
import { ChatType } from '../models/chatType';
import { AppContext } from '../../shared/models/appContext';
import { getApproveKeyboard } from '../keyboards/approve.keyboard';
import { MoreFacesStickers } from '../constants/moreFaces.stickers';
import { CallbackQueryType } from '../constants/callbackQueryType';
import { CapturesService } from '../service/captures.service';
import { UsersService } from '../service/users.service';

export class ActionsHandler {
  private capturesService: CapturesService;
  private usersService: UsersService;

  constructor(private db: firestore.Firestore) {
    this.capturesService = new CapturesService(db);
    this.usersService = new UsersService(db);
  }

  pong = (ctx: AppContext): Promise<Message> => {
    return ctx.reply(ctx.i18n.t('other.pong'));
  };

  register = async (ctx: AppContext): Promise<any> => {
    if (ctx.chat.type === ChatType.private) {
      return ctx.reply(ctx.i18n.t('error.rejectPrivate'));
    }

    const isUserInChat = await this.usersService.isUserInChat(ctx.chat.id, ctx.from.id);
    if (isUserInChat) {
      await ctx.reply(ctx.i18n.t('error.alreadyInGame'));
      return ctx.replyWithSticker(MoreFacesStickers.whatDoYouWant);
    }

    const hunter: Hunter = utils.createHunter(ctx);
    await this.usersService.addUserInChat(ctx.chat.id, hunter);

    return ctx.reply(
      ctx.i18n.t('user.greetNew', {
        user: utils.getGreetingNameForUser(hunter),
      }),
    );
  };

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

  getScore = async (ctx: AppContext): Promise<any> => {
    const hunters = await this.usersService.getAllUsersFromChat(ctx.chat.id);
    hunters.sort((a: Hunter, b: Hunter) => (b.score || 0) - (a.score || 0));

    return utils.getHuntersScore(ctx, hunters);
  };

  handleAdminAnswer = async (ctx: AppContext): Promise<any> => {
    const answerType: string = ctx.callbackQuery.data.split(' ')[0];

    if (answerType === CallbackQueryType.capture) {
      return this.handleHunterCapture(ctx);
    }

    throw new Error('unsupported callback query');
  };

  getHelp = async (ctx: AppContext): Promise<void> => {
    await ctx.replyWithSticker(MoreFacesStickers.ohMyGod);

    await ctx.reply(ctx.i18n.t('other.rules'));
  };

  aveMaks = (ctx: AppContext): Promise<any> => {
    return ctx.reply(ctx.i18n.t('other.maks'));
  };

  announce = async (ctx: AppContext): Promise<void> => {
    if (ctx.message.from.id !== 288950149) {
      await ctx.reply(ctx.i18n.t('announce.secretCommand'));
      return;
    }

    const chatIDs = await this.usersService.getAllActiveChatsIDs();

    const botCommand = ctx.message.entities.find(entity => entity.type === 'bot_command');
    const message = ctx.message.text.substring(botCommand.length);

    await chatIDs.forEach((id: number) => ctx.telegram.sendMessage(id, message));

    await ctx.reply(ctx.i18n.t('announce.sentTo'));
  };

  private handleHunterCapture = async (ctx: AppContext): Promise<void> => {
    const { message, data } = ctx.callbackQuery;
    const [, command, captureId, chatId] = data.split(' ');

    // delete message from admin's chat
    await ctx.telegram.deleteMessage(message.chat.id, message.message_id);

    // get record by capture id
    const record: CaptureRecord = await this.capturesService.getCaptureRecord(+chatId, captureId);
    const user = await this.usersService.getUserFromChat(record.hunterId, +chatId);

    const userGreetingName = utils.getGreetingNameForUser(user);

    if (command === 'approve') {
      await this.capturesService.approveCaptureRecord(+chatId, captureId);

      // TODO: remove this 2 lines after I'll migrate to gathering score from capture records
      const newPoints = (user.score || 0) + record.points;
      await this.usersService.updateUserPoints(+chatId, record.hunterId, newPoints);
    }

    const msg = ctx.i18n.t(`capture.${command}`, {
      user: userGreetingName,
      points: record.points,
    });

    await ctx.telegram.sendMessage(chatId, msg);
    await ctx.answerCbQuery(ctx.i18n.t('other.handled'));
  };
}
