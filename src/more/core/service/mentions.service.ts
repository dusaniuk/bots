import { inject, injectable } from 'inversify';

import { TYPES } from '../../types';

import { User } from '../interfaces/user';
import { Mention } from '../interfaces/catch';
import { UsersStore } from '../interfaces/store';
import { CatchMentions } from '../models/catchMentions';


@injectable()
export class MentionsService {
  constructor(
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
  ) {}

  getMentionedUsersData = async (chatId: number, mentions: Mention[] = []): Promise<CatchMentions> => {
    const chatMembers: User[] = await this.usersStore.getAllUsersFromChat(chatId);

    const victims: User[] = [];
    const unverifiedMentions: Mention[] = [];

    mentions.forEach((mention) => {
      const user = chatMembers.find(({ id, username }: User) => {
        return id === mention.id || username === mention.username;
      });

      if (user) {
        victims.push(user);
      } else {
        unverifiedMentions.push(mention);
      }
    });

    return new CatchMentions(victims, unverifiedMentions);
  }
}
