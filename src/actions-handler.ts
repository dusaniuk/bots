import Telegraf, { ContextMessageUpdate, Markup } from 'telegraf';

import { UsersDatabase } from './interfaces/users.database';
import { TelegrafResponseService } from './services/telegraf-response.service';

import { Hunter, Mention } from './models';
import * as utils from './utils/helpers';
import { Middleware } from './middleware';

export class ActionsHandler {
  public middleware: Middleware;

  constructor(private usersDb: UsersDatabase, private telegrafResponse: TelegrafResponseService) {
    this.middleware = new Middleware(telegrafResponse);
  }

  public register = async (ctx: ContextMessageUpdate): Promise<any> => {
    const isUserInChat = await this.usersDb.isUserInChat(ctx.from.id, ctx.chat.id);
    if (isUserInChat) {
      return this.telegrafResponse.userAlreadyInGame(ctx);
    }

    const hunter: Hunter = utils.createHunter(ctx);
    await this.usersDb.addUserInChat(hunter);

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

    const captureId = await this.usersDb.addCaptureRecord({
      hunterId: ctx.from.id,
      chatId: ctx.chat.id,
      victims: mentionedUsers,
    });

    const hunter = chatUsers.find(({ id }) => id === ctx.from.id);
    const msg = this.telegrafResponse.makeCaptureVictimsMsg(hunter, mentionedUsers);

    const adminId = chatUsers.find(({ isAdmin }: Hunter) => isAdmin).id;
    await ctx.telegram.sendMessage(
      adminId,
      `${msg}. Ти апруваєш?`,
      Markup.inlineKeyboard([Markup.callbackButton('Да', `approve ${captureId}`), Markup.callbackButton('Нєєє', `reject ${captureId}`)])
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
    const [command, captureId] = data.split(' ');

    // get record by capture id
    const record = await this.usersDb.getCaptureRecord(captureId);
    const { id, user } = await this.usersDb.getUserFromChat(record.hunterId, record.chatId);
    const userGreetingName = utils.getGreetingNameForUser(user);

    let userResponse;
    if (command === 'approve') {
      const points = utils.calculateEarnedPoints(record);
      const newPoints = (user.score || 0) + points;

      userResponse = `${userGreetingName} харооош. Ти заробив(ла) цілу кучу балів: ${points}.`;

      await this.usersDb.updateUserPoints(id, newPoints);
    } else {
      userResponse = `${userGreetingName} ти шо, хотів(ла) наїбати всіх тут? Відхилено!`;
    }

    await ctx.telegram.sendMessage(record.chatId, userResponse);

    // delete message from admin's chat
    await bot.telegram.deleteMessage(message.chat.id, message.message_id);

    return ctx.answerCbQuery('Всьо гуд, обробив заявочку.');
  };
}
