import Telegraf, { ContextMessageUpdate, Markup } from 'telegraf';

import { CONFIG } from './config';
import * as utils from './utils';
import { UsersDatabase } from './interfaces/users.database';
import { UsersService } from './services/users.service';
import { Hunter, Mention } from './models';
import { MessageService } from './services/message.service';
import { Server } from './utils/server';

const bot = new Telegraf(CONFIG.botToken);

const usersDb: UsersDatabase = new UsersService();
const messagesService: MessageService = new MessageService();

bot.command('reg', async (ctx: ContextMessageUpdate) => {
  const isUserInChat = await usersDb.isUserInChat(ctx.from.id, ctx.chat.id);
  if (isUserInChat) {
    return ctx.reply(messagesService.getAlreadyInGameMsg());
  }

  const hunter: Hunter = utils.createHunter(ctx);
  await usersDb.addUserInChat(hunter);

  const message = messagesService.getNewUserGreetingMsg(hunter);
  return ctx.reply(message);
});

bot.command('capture', async (ctx: ContextMessageUpdate) => {
  if (ctx.chat.id === -1001144984487) {
    return ctx.replyWithSticker('CAADAgADdwEAAl56qRYDru4cgqib-BYE');
  }

  const mentions: Mention[] = utils.getMentions(ctx.message);
  const chatUsers: Hunter[] = await usersDb.getAllUsersFromChat(ctx.chat.id);

  const mentionedUsers = utils.getMentionedUsers(mentions, chatUsers);

  if (mentionedUsers.length === 0) {
    return ctx.reply("There's no users to capture");
  }

  const captureId = await usersDb.addCaptureRecord({
    hunterId: ctx.from.id,
    chatId: ctx.chat.id,
    victims: mentionedUsers,
  });

  const hunter = chatUsers.find(({ id }) => id === ctx.from.id);
  const message = messagesService.getCapturedVictimsMsg(hunter, mentionedUsers);

  const adminId = chatUsers.find(({ isAdmin }: Hunter) => isAdmin).id;
  await ctx.telegram.sendMessage(
    adminId,
    `${message}. Approve or reject?`,
    Markup.inlineKeyboard([
      Markup.callbackButton('Approve', `approve ${captureId}`),
      Markup.callbackButton('Reject', `reject ${captureId}`),
    ])
      .oneTime(true)
      .resize()
      .extra(),
  );

  return ctx.reply(message, { disable_notification: true });
});

bot.command('score', async (ctx: ContextMessageUpdate) => {
  const users = await usersDb.getAllUsersFromChat(ctx.chat.id);

  let msg = '';

  users.sort((a: Hunter, b: Hunter) => (b.score || 0) - (a.score || 0));

  users.forEach((user: Hunter, index: number) => {
    let name = messagesService.getGreetingNameForUser(user);
    if (name.startsWith('@')) {
      name = name.substring(1);
    }

    msg += `${index + 1}) ${name}: ${user.score || 0} \n`;
  });

  return ctx.reply(msg);
});

bot.on('callback_query', async (ctx: ContextMessageUpdate) => {
  const { message, data } = ctx.update.callback_query;
  const [command, captureId] = data.split(' ');

  // get record by capture id
  const record = await usersDb.getCaptureRecord(captureId);
  const { id, user } = await usersDb.getUserFromChat(record.hunterId, record.chatId);
  const userGreetingName = utils.getGreetingNameForUser(user);

  let userResponse;
  if (command === 'approve') {
    const points = utils.getPoints(record);
    const newPoints = (user.score || 0) + points;

    userResponse = `${points} points for ${userGreetingName}.`;

    await usersDb.updateUserPoints(id, newPoints);
  } else {
    userResponse = `${userGreetingName} catch has been rejected.`;
  }

  await ctx.telegram.sendMessage(record.chatId, userResponse);

  // delete message from admin's chat
  await bot.telegram.deleteMessage(message.chat.id, message.message_id);

  return ctx.answerCbQuery('Catch has been handled!');
});

bot
  .launch()
  .then(() => console.log('Bot has been started'))
  .catch(err => console.error(err));

// startup a simple application so heroku won't shut down it
const server = new Server();
server.run();
