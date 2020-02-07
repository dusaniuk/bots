import { inject, injectable } from 'inversify';

import { TYPES } from '../ioc/types';
import { MentionsParser } from './mentions.parser';
import { AppContext } from '../../shared/interfaces';
import { Mention, User, UsersStore } from '../interfaces';
import { CatchMentions } from '../models';

@injectable()
export class MentionsService {
  constructor(
    @inject(TYPES.MENTION_PARSER) private parser: MentionsParser,
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
  ) {}

  getMentionsFromContext = async (ctx: AppContext): Promise<CatchMentions> => {
    const mentions: Mention[] = this.parser.getMentionsFromContext(ctx) ?? [];
    const chatMembers: User[] = await this.usersStore.getAllUsersFromChat(ctx.chat.id);

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

    const chatAdmin: User = chatMembers?.find((user: User) => user.isAdmin);
    const hunter: User = chatMembers?.find((user: User) => user.id === ctx.from.id);

    return new CatchMentions(chatAdmin, hunter, victims, unverifiedMentions);
  }
}
