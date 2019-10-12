import Telegraf, { ContextMessageUpdate, Markup } from 'telegraf';

import { UsersDatabase } from '../interfaces/users.database';
import { TelegrafResponseService } from '../services/telegraf-response.service';

import { Hunter, Mention } from '../models';
import * as utils from '../utils/helpers';
import { Middleware } from './middleware';

export class ActionsHandler {
  public middleware: Middleware;

  constructor(private usersDb: UsersDatabase, private telegrafResponse: TelegrafResponseService) {
    this.middleware = new Middleware(telegrafResponse);
  }

  public pong = (ctx: ContextMessageUpdate) => {
    return ctx.reply('pong');
  };

  public register = async (ctx: ContextMessageUpdate): Promise<any> => {
    const isUserInChat = await this.usersDb.isUserInChat(ctx.chat.id, ctx.from.id);
    if (isUserInChat) {
      return this.telegrafResponse.userAlreadyInGame(ctx);
    }

    const hunter: Hunter = utils.createHunter(ctx);
    await this.usersDb.addUserInChat(ctx.chat.id, hunter);

    return this.telegrafResponse.greetNewUser(ctx, hunter);
  };

  public capture = async (ctx: ContextMessageUpdate): Promise<any> => {
    const mentions: Mention[] = utils.getMentions(ctx.message);
    if (mentions.length === 0) {
      return this.telegrafResponse.showCaptureInstructions(ctx);
    }

    const chatUsers: Hunter[] = await this.usersDb.getAllUsersFromChat(ctx.chat.id);
    const mentionedUsers = utils.getMentionedUsers(mentions, chatUsers);

    if (mentionedUsers.length === 0) {
      return this.telegrafResponse.noUsersToCapture(ctx);
    }

    const captureId = await this.usersDb.addCaptureRecord(ctx.chat.id, {
      approved: false,
      hunterId: ctx.from.id,
      timestamp: new Date().getTime(),
      victims: mentionedUsers.map(user => user.id),
    });

    const hunter = chatUsers.find(({ id }) => id === ctx.from.id);
    const msg = this.telegrafResponse.makeCaptureVictimsMsg(hunter, mentionedUsers);

    const adminId = chatUsers.find(({ isAdmin }: Hunter) => isAdmin).id;
    await ctx.telegram.sendMessage(
      adminId,
      `${msg}. Ти апруваєш?`,
      Markup.inlineKeyboard([
        Markup.callbackButton('Да', `approve ${captureId} ${ctx.chat.id}`),
        Markup.callbackButton('Нєєє', `reject ${captureId} ${ctx.chat.id}`),
      ])
        .oneTime(true)
        .resize()
        .extra(),
    );

    return ctx.reply(msg, { disable_notification: true });
  };

  public getScore = async (ctx: ContextMessageUpdate): Promise<any> => {
    const hunters = await this.usersDb.getAllUsersFromChat(ctx.chat.id);
    hunters.sort((a: Hunter, b: Hunter) => (b.score || 0) - (a.score || 0));

    return this.telegrafResponse.getHuntersScore(ctx, hunters);
  };

  public handleAdminAnswer = (bot: Telegraf<ContextMessageUpdate>) => async (ctx: ContextMessageUpdate): Promise<any> => {
    const { message, data } = ctx.update.callback_query;
    const [command, captureId, chatId] = data.split(' ');

    // get record by capture id
    const record = await this.usersDb.getCaptureRecord(+chatId, captureId);
    const user = await this.usersDb.getUserFromChat(record.hunterId, +chatId);

    const userGreetingName = utils.getGreetingNameForUser(user);

    let userResponse;
    if (command === 'approve') {
      const points = utils.calculateEarnedPoints(record);
      const newPoints = (user.score || 0) + points;

      userResponse = `${userGreetingName} харооош. Ти заробив(ла) цілу кучу балів: ${points}.`;

      await this.usersDb.updateUserPoints(+chatId, record.hunterId, newPoints);
    } else {
      userResponse = `${userGreetingName} ти шо, хотів(ла) наїбати всіх тут? Відхилено!`;
    }

    await ctx.telegram.sendMessage(chatId, userResponse);

    // delete message from admin's chat
    await bot.telegram.deleteMessage(message.chat.id, message.message_id);

    return ctx.answerCbQuery('Всьо гуд, обробив заявочку.');
  };

  public getHelp = (ctx: ContextMessageUpdate) => {
    return this.telegrafResponse.explainRulesToUser(ctx);
  };

  public announce = async (ctx: ContextMessageUpdate) => {
    if (ctx.message.from.id !== 288950149) {
      return 'Маладєц, найшов сікрєтну команду. Но ти не можеш її юзати';
    }

    const chatIDs = await this.usersDb.getAllActiveChatsIDs();

    const botCommand = ctx.message.entities.find(entity => entity.type === 'bot_command');
    const message = ctx.message.text.substring(botCommand.length);

    await chatIDs.forEach((id: number) => ctx.telegram.sendMessage(id, message));

    return ctx.reply(`Розіслано в наступні чати: ${chatIDs}`);
  };
}
