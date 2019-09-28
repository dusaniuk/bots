import { User } from '../models';
import { getGreetingNameForUser } from '../utils/helpers';

export class MessageService {
  getAlreadyInGameMsg = (): string => "Hey, you're already in the game!";

  getNewUserGreetingMsg = (user: User): string => {
    const userGreetingName = this.getGreetingNameForUser(user);

    return `Welcome, ${userGreetingName}. Fight for your points!`;
  };

  getCapturedVictimsMsg = (hunter: User, victims: User[]): string => {
    const hunterName = getGreetingNameForUser(hunter);

    let message = `${hunterName} has captured ${victims.length} pokemon(s): `;

    victims.forEach((user) => {
      message += ` ${getGreetingNameForUser(user)},`;
    });

    return message.substring(0, message.length - 1);
  };

  getGreetingNameForUser = ({ username, firstName, lastName }: User): string => {
    if (username) {
      return username;
    }

    const name = [firstName];
    if (lastName) {
      name.push(lastName);
    }

    return name.join(' ');
  };
}
