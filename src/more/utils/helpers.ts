import { User as TelegrafUser } from 'telegraf/typings/telegram-types';

import { User, UserWithScore } from '../interfaces';


export const createUser = (telegrafUser: TelegrafUser): User => {
  const user: User = {
    id: telegrafUser.id,
    firstName: telegrafUser.first_name,
  };

  if (telegrafUser.username) {
    user.username = telegrafUser.username;
  }

  if (telegrafUser.last_name) {
    user.lastName = telegrafUser.last_name;
  }

  return user;
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

export const getUsersScore = (users: UserWithScore[]): string => {
  let msg = '';

  users
    .forEach((user: UserWithScore, index: number) => {
      let name = getGreetingNameForUser(user.user);
      if (name.startsWith('@')) {
        name = name.substring(1);
      }

      msg += `\n${index + 1}) ${name}: ${user.points}`;
    });

  return msg;
};
