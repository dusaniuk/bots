import Telegraf, { ContextMessageUpdate, Markup } from 'telegraf';

import { Database } from '../interfaces/database';
import { TelegrafResponseService } from '../services/telegraf-response.service';

import { CaptureRecord, Hunter, Mention } from '../models';
import * as utils from '../utils/helpers';
import { Middleware } from './middleware';

const enum CallbackQueryType {
  capture = 'capture',
}

export class ActionsHandler {
  public middleware: Middleware;

  constructor(private db: Database, private telegrafResponse: TelegrafResponseService) {
    this.middleware = new Middleware(telegrafResponse);
  }

  pong = (ctx: ContextMessageUpdate) => {
    return ctx.reply('pong');
  };

  register = async (ctx: ContextMessageUpdate): Promise<any> => {
    const isUserInChat = await this.db.isUserInChat(ctx.chat.id, ctx.from.id);
    if (isUserInChat) {
      return this.telegrafResponse.userAlreadyInGame(ctx);
    }

    const hunter: Hunter = utils.createHunter(ctx);
    await this.db.addUserInChat(ctx.chat.id, hunter);

    return this.telegrafResponse.greetNewUser(ctx, hunter);
  };

  capture = async (ctx: ContextMessageUpdate): Promise<any> => {
    const mentions: Mention[] = utils.getMentions(ctx.message);
    if (mentions.length === 0) {
      return this.telegrafResponse.showCaptureInstructions(ctx);
    }

    const chatUsers: Hunter[] = await this.db.getAllUsersFromChat(ctx.chat.id);
    const mentionedUsers = utils.getMentionedUsers(mentions, chatUsers);

    if (mentionedUsers.length === 0) {
      return this.telegrafResponse.noUsersToCapture(ctx);
    }

    const captureId = await this.db.addCaptureRecord(ctx.chat.id, {
      approved: false,
      hunterId: ctx.from.id,
      timestamp: new Date().getTime(),
      victims: mentionedUsers.map(user => user.id),
      points: mentionedUsers.length * 4, // TODO: change this logic in future
    });

    const hunter = chatUsers.find(({ id }) => id === ctx.from.id);
    const msg = this.telegrafResponse.makeCaptureVictimsMsg(hunter, mentionedUsers);

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

    return this.telegrafResponse.getHuntersScore(ctx, hunters);
  };

  handleAdminAnswer = (bot: Telegraf<ContextMessageUpdate>) => async (ctx: ContextMessageUpdate): Promise<any> => {
    const answerType: string = ctx.update.callback_query.data.split(' ')[0];

    switch (answerType) {
      case CallbackQueryType.capture:
        return this.handleHunterCapture(bot, ctx);
      default:
        throw new Error('unsupported callback query');
    }
  };

  getHelp = (ctx: ContextMessageUpdate): Promise<any> => {
    return this.telegrafResponse.explainRulesToUser(ctx);
  };

  announce = async (ctx: ContextMessageUpdate): Promise<any> => {
    if (ctx.message.from.id !== 288950149) {
      return 'Маладєц, найшов сікрєтну команду. Но ти не можеш її юзати';
    }

    const chatIDs = await this.db.getAllActiveChatsIDs();

    const botCommand = ctx.message.entities.find(entity => entity.type === 'bot_command');
    const message = ctx.message.text.substring(botCommand.length);

    await chatIDs.forEach((id: number) => ctx.telegram.sendMessage(id, message));

    return ctx.reply(`Розіслано в наступні чати: ${chatIDs}`);
  };

  private handleHunterCapture = async (bot: Telegraf<ContextMessageUpdate>, ctx: ContextMessageUpdate): Promise<any> => {
    const { message, data } = ctx.update.callback_query;
    const [, command, captureId, chatId] = data.split(' ');

    // delete message from admin's chat
    await bot.telegram.deleteMessage(message.chat.id, message.message_id);

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
