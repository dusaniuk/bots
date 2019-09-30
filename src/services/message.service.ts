import { User } from '../models';
import { getGreetingNameForUser } from '../utils/helpers';

export class MessageService {
  getCapturedVictimsMsg = (hunter: User, victims: User[]): string => {
    const hunterName = getGreetingNameForUser(hunter);

    let message = `${hunterName} has captured ${victims.length} pokemon(s): `;

    victims.forEach((user) => {
      message += ` ${getGreetingNameForUser(user)},`;
    });

    return message.substring(0, message.length - 1);
  };
}
