import { Score, User, UserWithScore } from '../../core/interfaces/user';


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

export const getVictimsMsg = (victims: User[]): string => {
  let message = '';

  victims.forEach((user) => {
    message += ` ${getGreetingNameForUser(user)},`;
  });

  return message.substring(0, message.length - 1);
};

export const getUsersScore = (score: Score): string => {
  let msg = '';

  score
    .forEach((user: UserWithScore, index: number) => {
      let name = getGreetingNameForUser(user.user);
      if (name.startsWith('@')) {
        name = name.substring(1);
      }

      msg += `\n${index + 1}) ${name}: ${user.points}`;
    });

  return msg;
};
