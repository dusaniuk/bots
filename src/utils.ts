import { Context } from 'telegraf';
import { Hunter } from './models/hunter.model';

export const createHunter = ({ from, chat }: Context): Hunter => ({
  id: from.id,
  firstName: from.first_name,
  lastName: from.last_name || '',
  username: from.username || '',
});

export const getHunterName = ({ username, firstName, lastName }: Hunter): string => {
  if (username) {
    return username;
  }

  const name = [firstName];
  if (lastName) {
    name.push(lastName);
  }

  return name.join(' ');
};
