import { Context } from 'telegraf';
import { IncomingMessage } from 'telegraf/typings/telegram-types';
import { Hunter, Mention, User } from './models';

export const createHunter = ({ from, chat }: Context): Hunter => ({
  id: from.id,
  chatId: chat.id,
  firstName: from.first_name,
  lastName: from.last_name || '',
  username: `@${from.username}` || '',
});

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

export const getMentions = (message: IncomingMessage): Mention[] => {
  const mentionedUsers: Mention[] = [];

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

export const getMentionedUsers = (mentions: Mention[], users: User[]): User[] => {
  const mentionedUsers: User[] = [];

  mentions.forEach((mention: Mention) => {
    if (mention.id) {
      const user = users.find(({ id }: User) => id === mention.id);
      mentionedUsers.push(user);
      return;
    }

    const user = users.find(({ username }: User) => username === mention.username);
    if (user) {
      mentionedUsers.push(user);
    } else {
      mentionedUsers.push({ username: mention.username } as User);
    }
  });

  return mentionedUsers;
};
