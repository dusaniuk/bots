import Telegraf, { ContextMessageUpdate, Markup } from 'telegraf';

import { UsersDatabase } from './interfaces/users.database';
import { MessageService } from './services/message.service';

import { Hunter, Mention } from './models';
import * as utils from './utils/helpers';

export class ActionsHandler {
  constructor(private usersDb: UsersDatabase, private messagesService: MessageService) {}

  public register = async (ctx: ContextMessageUpdate): Promise<any> => {
    const isUserInChat = await this.usersDb.isUserInChat(ctx.from.id, ctx.chat.id);
    if (isUserInChat) {
      return ctx.reply(this.messagesService.getAlreadyInGameMsg());
    }

    const hunter: Hunter = utils.createHunter(ctx);
    await this.usersDb.addUserInChat(hunter);

    const message = this.messagesService.getNewUserGreetingMsg(hunter);
    return ctx.reply(message);
  };

  public capture = async (ctx: ContextMessageUpdate): Promise<any> => {
    const mentions: Mention[] = utils.getMentions(ctx.message);
    const chatUsers: Hunter[] = await this.usersDb.getAllUsersFromChat(ctx.chat.id);

    const mentionedUsers = utils.getMentionedUsers(mentions, chatUsers);

    if (mentionedUsers.length === 0) {
      return ctx.reply("There's no users to capture");
    }

    const captureId = await this.usersDb.addCaptureRecord({
      hunterId: ctx.from.id,
      chatId: ctx.chat.id,
      victims: mentionedUsers,
    });

    const hunter = chatUsers.find(({ id }) => id === ctx.from.id);
    const message = this.messagesService.getCapturedVictimsMsg(hunter, mentionedUsers);

    const adminId = chatUsers.find(({ isAdmin }: Hunter) => isAdmin).id;
    await ctx.telegram.sendMessage(
      adminId,
      `${message}. Approve or reject?`,
      Markup.inlineKeyboard([Markup.callbackButton('Approve', `approve ${captureId}`), Markup.callbackButton('Reject', `reject ${captureId}`)])
        .oneTime(true)
        .resize()
        .extra(),
    );

    return ctx.reply(message, { disable_notification: true });
  };

  public getScore = async (ctx: ContextMessageUpdate): Promise<any> => {
    const users = await this.usersDb.getAllUsersFromChat(ctx.chat.id);

    let msg = '';

    users.sort((a: Hunter, b: Hunter) => (b.score || 0) - (a.score || 0));

    users.forEach((user: Hunter, index: number) => {
      let name = this.messagesService.getGreetingNameForUser(user);
      if (name.startsWith('@')) {
        name = name.substring(1);
      }

      msg += `${index + 1}) ${name}: ${user.score || 0} \n`;
    });

    return ctx.reply(msg);
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
      const points = utils.getPoints(record);
      const newPoints = (user.score || 0) + points;

      userResponse = `${points} points for ${userGreetingName}.`;

      await this.usersDb.updateUserPoints(id, newPoints);
    } else {
      userResponse = `${userGreetingName} catch has been rejected.`;
    }

    await ctx.telegram.sendMessage(record.chatId, userResponse);

    // delete message from admin's chat
    await bot.telegram.deleteMessage(message.chat.id, message.message_id);

    return ctx.answerCbQuery('Catch has been handled!');
  };
}
