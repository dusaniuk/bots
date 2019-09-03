import Telegraf, { ContextMessageUpdate } from 'telegraf';
import { IncomingMessage } from 'telegraf/typings/telegram-types';

import CONFIG from './config';
import { Hunter } from './models/hunter.model';
import { createHunter, getHunterName } from './utils';
import { UsersDatabase } from './interfaces/users.database';
import { UsersService } from './services/users.service';
import { CaptureRecord } from './models/capture-record.model';

const bot = new Telegraf(CONFIG.botToken);

const usersDb: UsersDatabase = new UsersService();

export interface MentionedUser {
  id?: number;
  username?: string;
}

export const getMentionedUsers = (message: IncomingMessage): MentionedUser[] => {
  const mentionedUsers: MentionedUser[] = [];

  message.entities
    .filter(entity => entity.type.endsWith('mention'))
    .forEach((mention) => {
      if (mention.type === 'mention') {
        mentionedUsers.push({ username: message.text.substr(mention.offset, mention.length) });
      } else if (mention.type === 'text_mention') {
        mentionedUsers.push({ id: mention.user.id });
      }
    });

  return mentionedUsers;
};

bot.command('reg', async (ctx: ContextMessageUpdate) => {
  const isUserInChat = await usersDb.isUserInChat(ctx.from.id, ctx.chat.id);
  if (isUserInChat) {
    return ctx.reply("Hey, you're already in the game!");
  }

  const hunter: Hunter = createHunter(ctx);
  await usersDb.addUserInChat(hunter, ctx.chat.id);

  const userGreetingName = getHunterName(hunter);

  return ctx.reply(`Welcome, ${userGreetingName}. Fight for your points!`);
});

bot.command('capture', async (ctx: ContextMessageUpdate) => {
  const mentions: MentionedUser[] = getMentionedUsers(ctx.message);
  const chatUsers = await usersDb.getAllUsersFromChat(ctx.chat.id);

  const mentionedUsers = [];

  mentions.forEach((mention: MentionedUser) => {
    if (mention.id) {
      const user = chatUsers.find(({ id }: Hunter) => id === mention.id);
      mentionedUsers.push(user);
      return;
    }

    const user = chatUsers.find(({ username }: Hunter) => username === mention.username);
    if (user) {
      mentionedUsers.push(user);
    } else {
      mentionedUsers.push({ username: mention.username });
    }
  });

  const captureRecord: CaptureRecord = {
    hunterId: ctx.from.id,
    chatId: ctx.chat.id,
    victims: mentionedUsers,
  };

  await usersDb.addCaptureRecord(captureRecord);

  const hunter = getHunterName(chatUsers.find(({ id }) => id === ctx.from.id));

  let message = `${hunter} has captured ${mentionedUsers.length} pokemons: `;
  mentionedUsers.forEach((user) => {
    message += ` ${getHunterName(user)};`;
  });

  return ctx.reply(message, { disable_notification: true });
});

bot.launch();
