import { injectable } from 'inversify';
import { IncomingMessage, MessageEntity, User as TelegrafUser } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../../shared/interfaces';

import { User } from '../../core/interfaces/user';
import { Mention } from '../../core/interfaces/catch';

import { MessageEntityType } from '../constants/message-entity-type';


@injectable()
export class ContextParser {
  mapToUserEntity = (telegrafUser: TelegrafUser): User => {
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

  getMentionsFromContext = (ctx: AppContext): Mention[] => {
    const mentions: Mention[] = this.parseMentions(ctx);

    return this.filterUniqueMentions(mentions);
  };

  private parseMentions = (ctx: AppContext): Mention[] => {
    const message: IncomingMessage = ctx.message;
    const entities: MessageEntity[] = message?.entities ?? [];

    const mentions: MessageEntity[] = entities.filter(this.isUserMentioned);

    return mentions.map((entity: MessageEntity) => {
      return this.mapMessageEntityToMention(entity, message.text);
    });
  };

  private isUserMentioned = (entity: MessageEntity): boolean => {
    return entity.type === MessageEntityType.Text
      || entity.type === MessageEntityType.Username;
  };

  private mapMessageEntityToMention = (entity: MessageEntity, messageText: string): Mention => {
    if (entity.type === MessageEntityType.Text) {
      return { id: entity.user.id };
    }

    return {
      username: messageText.substr(entity.offset, entity.length).replace('@', ''),
    };
  };

  private filterUniqueMentions = (mentions: Mention[]): Mention[] => {
    const uniqueMentions: Mention[] = [];

    for (const mention of mentions) {
      const alreadyMentioned: boolean = this.hasMentionInArray(uniqueMentions, mention);
      if (!alreadyMentioned) {
        uniqueMentions.push(mention);
      }
    }

    return uniqueMentions;
  };

  private hasMentionInArray = (array: Mention[], value: Mention): boolean => {
    return array.some((mention: Mention) => {
      const usernameMatch: boolean = mention.username === value.username && typeof value.username !== 'undefined';
      const idMatch: boolean = mention.id === value.id && typeof value.id !== 'undefined';

      return usernameMatch || idMatch;
    });
  }
}
