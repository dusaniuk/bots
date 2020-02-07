import { injectable } from 'inversify';
import { IncomingMessage, MessageEntity } from 'telegraf/typings/telegram-types';

import { Mention } from '../interfaces';
import { AppContext } from '../../shared/interfaces';

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
      username: messageText.substr(entity.offset + 1, entity.length).trim(),
    };
  };

  private filterUniqueMentions = (mentions: Mention[]): Mention[] => {
    return mentions.reduce((acc: Array<Mention>, val: Mention) => {
      const alreadyMentioned: boolean = this.hasMentionInArray(acc, val);

      return alreadyMentioned ? acc : [...acc, val];
    }, []);
  };

  private hasMentionInArray = (array: Mention[], value: Mention): boolean => {
    return array.some((mention: Mention) => {
      return mention.username === value.username || mention.id === value.id;
    });
  }
}
