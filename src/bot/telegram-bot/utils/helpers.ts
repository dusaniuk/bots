import { User } from '../../core/interfaces/user';

export const getGreetingNameForUser = ({ firstName, lastName }: User): string => {
  const name = [firstName];
  if (lastName) {
    name.push(lastName);
  }

  return name.join(' ');
};
