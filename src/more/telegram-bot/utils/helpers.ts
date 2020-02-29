import { User } from '../../core/interfaces/user';


export const getGreetingNameForUser = ({ username, firstName, lastName }: User): string => {
  if (username) {
    return `@${username}`;
  }

  const name = [firstName];
  if (lastName) {
    name.push(lastName);
  }

  return name.join(' ');
};
