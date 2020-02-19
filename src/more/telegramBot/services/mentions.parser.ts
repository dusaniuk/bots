import { injectable } from 'inversify';
import { IncomingMessage, MessageEntity } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../../shared/interfaces';
import { Mention } from '../../core/interfaces/catch';

enum MentionType {
  Username = 'mention',
  Text = 'text_mention'
}

@injectable()
export class MentionsParser {
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
    return entity.type === MentionType.Text
      || entity.type === MentionType.Username;
  };

  private mapMessageEntityToMention = (entity: MessageEntity, messageText: string): Mention => {
    if (entity.type === MentionType.Text) {
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
