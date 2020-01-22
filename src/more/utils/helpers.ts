import { Context } from 'telegraf';
import { IncomingMessage } from 'telegraf/typings/telegram-types';

import { Hunter, Mention, User } from '../models';

export const createHunter = ({ from }: Context): Hunter => {
  const hunter: Hunter = {
    id: from.id,
    firstName: from.first_name,
  };

  if (from.username) {
    hunter.username = `@${from.username}`;
  }

  if (from.last_name) {
    hunter.lastName = from.last_name;
  }

  return hunter;
};

export const getGreetingNameForUser = ({ username, firstName, lastName }: User): string => {
  if (username) {
    return username;
  }

  const name = [firstName];
  if (lastName) {
    name.push(lastName);
  }

  return name.join(' ');
};

export const getVictimsMsg = (victims: User[]): string => {
  let message = '';

  victims.forEach((user) => {
    message += ` ${getGreetingNameForUser(user)},`;
  });

  return message.substring(0, message.length - 1);
};

export const getMentions = (message: IncomingMessage): Mention[] => {
  return message.entities
    .filter(entity => entity.type.endsWith('mention'))
    .map((mention) => {
      switch (mention.type) {
        case 'mention':
          return { username: message.text.substr(mention.offset, mention.length) };
        case 'text_mention':
          return { id: mention.user.id };
        default:
          throw new Error('telegram has added a new type of mention??');
      }
    });
};

export const getMentionedUsers = (mentions: Mention[], users: User[]): User[] => {
  const mentionedUsers: User[] = [];

  mentions.forEach((mention: Mention) => {
    const user = users.find(({ id, username }: User) => {
      return id === mention.id || username === mention.username;
    });

    if (user) {
      mentionedUsers.push(user);
      return;
    }

    // if user ain't in users list: just add it to an array for future tracking
    if (mention.username) {
      mentionedUsers.push({ username: mention.username } as User);
    }
  });

  return mentionedUsers;
};

export const getHuntersScore = (hunters: Hunter[]): string => {
  let msg = '';

  hunters
    .filter((user: Hunter) => user.score)
    .forEach((user: Hunter, index: number) => {
      let name = getGreetingNameForUser(user);
      if (name.startsWith('@')) {
        name = name.substring(1);
      }

      msg += `\n${index + 1}) ${name}: ${user.score || 0}`;
    });

  return msg;
};
