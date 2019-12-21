import { ContextMessageUpdate, Markup } from 'telegraf';
import { Message } from 'telegraf/typings/telegram-types';

import { Database } from '../interfaces/database';
import { TelegrafResponseService } from '../services/telegraf-response.service';

import {
  CaptureRecord, Hunter, Mention, User,
} from '../models';
import * as utils from '../utils/helpers';
import { ChatType } from '../models/chatType';

const enum CallbackQueryType {
  capture = 'capture',
}

export class ActionsHandler {
  constructor(private db: Database, private response: TelegrafResponseService) {}

  pong = (ctx: ContextMessageUpdate): Promise<Message> => {
    return this.response.pong(ctx);
  };

  register = async (ctx: ContextMessageUpdate): Promise<any> => {
    if (ctx.chat.type === ChatType.private) {
      return this.response.rejectPrivateChat(ctx);
    }

    const isUserInChat = await this.db.isUserInChat(ctx.chat.id, ctx.from.id);
    if (isUserInChat) {
      return this.response.userAlreadyInGame(ctx);
    }

    const hunter: Hunter = utils.createHunter(ctx);
    await this.db.addUserInChat(ctx.chat.id, hunter);

    return this.response.greetNewUser(ctx, hunter);
  };

  capture = async (ctx: ContextMessageUpdate): Promise<any> => {
    const mentions: Mention[] = utils.getMentions(ctx.message);
    if (mentions.length === 0) {
      return this.response.showCaptureInstructions(ctx);
    }

    const chatUsers: Hunter[] = await this.db.getAllUsersFromChat(ctx.chat.id);
    const mentionedUsers = utils.getMentionedUsers(mentions, chatUsers);

    const isMentionedHimself: boolean = mentionedUsers.some(u => u.id === ctx.from.id);
    if (isMentionedHimself) {
      return this.response.rejectSelfCapture(ctx);
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
      let msg = 'Хммм, тут в нас є юзери, яких немєа в базі. Одмен перевір пліз цих камєрунців: ';

      unverifiedUsers.forEach((user) => {
        msg += ` ${user.username}`;
      });

      await ctx.reply(msg);
    }

    if (validUsers.length === 0) {
      return this.response.noUsersToCapture(ctx);
    }

    const captureId = await this.db.addCaptureRecord(ctx.chat.id, {
      approved: false,
      hunterId: ctx.from.id,
      timestamp: new Date().getTime(),
      victims: validUsers.filter(user => user.id !== null).map(user => user.id),
      points: validUsers.length * 4, // TODO: change this logic in future
    });

    const hunter = chatUsers.find(({ id }) => id === ctx.from.id);
    const msg = this.response.makeCaptureVictimsMsg(hunter, validUsers);

    const adminId = chatUsers.find(({ isAdmin }: Hunter) => isAdmin).id;
    await ctx.telegram.sendMessage(
      adminId,
      `${msg}. Ти апруваєш?`,
      Markup.inlineKeyboard([
        Markup.callbackButton('Да', `${CallbackQueryType.capture} approve ${captureId} ${ctx.chat.id}`),
        Markup.callbackButton('Нєєє', `${CallbackQueryType.capture} reject ${captureId} ${ctx.chat.id}`),
      ])
        .oneTime(true)
        .resize()
        .extra(),
    );

    return ctx.reply(msg, { disable_notification: true });
  };

  getScore = async (ctx: ContextMessageUpdate): Promise<any> => {
    const hunters = await this.db.getAllUsersFromChat(ctx.chat.id);
    hunters.sort((a: Hunter, b: Hunter) => (b.score || 0) - (a.score || 0));

    return this.response.getHuntersScore(ctx, hunters);
  };

  handleAdminAnswer = async (ctx: ContextMessageUpdate): Promise<any> => {
    const answerType: string = ctx.callbackQuery.data.split(' ')[0];

    switch (answerType) {
      case CallbackQueryType.capture:
        return this.handleHunterCapture(ctx);
      default:
        throw new Error('unsupported callback query');
    }
  };

  getHelp = (ctx: ContextMessageUpdate): Promise<Message> => {
    return this.response.explainRulesToUser(ctx);
  };

  aveMaks = (ctx: ContextMessageUpdate): Promise<any> => {
    return this.response.aveMaks(ctx);
  };

  announce = async (ctx: ContextMessageUpdate): Promise<any> => {
    if (ctx.message.from.id !== 288950149) {
      return ctx.reply('Маладєц, найшов сікрєтну команду. Но ти не можеш її юзати');
    }

    const chatIDs = await this.db.getAllActiveChatsIDs();

    const botCommand = ctx.message.entities.find(entity => entity.type === 'bot_command');
    const message = ctx.message.text.substring(botCommand.length);

    await chatIDs.forEach((id: number) => ctx.telegram.sendMessage(id, message));

    return ctx.reply(`Розіслано в наступні чати: ${chatIDs}`);
  };

  private handleHunterCapture = async (ctx: ContextMessageUpdate): Promise<any> => {
    const { message, data } = ctx.callbackQuery;
    const [, command, captureId, chatId] = data.split(' ');

    // delete message from admin's chat
    await ctx.telegram.deleteMessage(message.chat.id, message.message_id);

    // get record by capture id
    const record: CaptureRecord = await this.db.getCaptureRecord(+chatId, captureId);
    const user = await this.db.getUserFromChat(record.hunterId, +chatId);

    const userGreetingName = utils.getGreetingNameForUser(user);

    let userResponse;
    if (command === 'approve') {
      await this.db.approveCaptureRecord(+chatId, captureId);

      // TODO: remove this 2 lines after I'll migrate to gathering score from capture records
      const newPoints = (user.score || 0) + record.points;
      await this.db.updateUserPoints(+chatId, record.hunterId, newPoints);

      userResponse = `${userGreetingName} харооош. Ти заробив(ла) цілу кучу балів: ${record.points}.`;
    } else {
      userResponse = `${userGreetingName} ти шо, хотів(ла) наїбати всіх тут? Відхилено!`;
    }

    await ctx.telegram.sendMessage(chatId, userResponse);

    return ctx.answerCbQuery('Всьо гуд, обробив заявочку.');
  };
}