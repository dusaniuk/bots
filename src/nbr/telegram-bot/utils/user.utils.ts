import { User as TelegrafUser } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../../shared/interfaces/app-context';

const getUserFullName = (user: TelegrafUser): string => {
  return `${user.first_name} ${user.last_name || ''}`.trimRight();
};

export const stringifyUserGreeting = ({ from }: AppContext): string => {
  const user = getUserFullName(from);

  return from.username ? `*${user}* (@${from.username})` : `*${user}*`;
};

export const stringifyUsers = (users: TelegrafUser[]): string => {
  return users.reduce((msg: string, user: TelegrafUser) => {
    const fullName = getUserFullName(user);
    return msg === '' ? fullName : `${msg}, ${fullName}`;
  }, '');
};
