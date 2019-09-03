import Telegraf, { ContextMessageUpdate } from 'telegraf';

import { CONFIG } from './config';
import * as utils from './utils';
import { UsersDatabase } from './interfaces/users.database';
import { UsersService } from './services/users.service';
import { Hunter, Mention, User } from './models';
import { MessageService } from './services/message.service';

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
  const mentions: Mention[] = utils.getMentions(ctx.message);
  const chatUsers: User[] = await usersDb.getAllUsersFromChat(ctx.chat.id);

  const mentionedUsers = utils.getMentionedUsers(mentions, chatUsers);

  await usersDb.addCaptureRecord({
    hunterId: ctx.from.id,
    chatId: ctx.chat.id,
    victims: mentionedUsers,
  });

  const hunter = chatUsers.find(({ id }) => id === ctx.from.id);
  const message = messagesService.getCapturedVictimsMsg(hunter, mentionedUsers);

  return ctx.reply(message, { disable_notification: true });
});

bot.launch();
