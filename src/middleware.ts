import { ContextMessageUpdate } from 'telegraf';

import { TelegrafResponseService } from './services/telegraf-response.service';

export const enum ChatType {
  private = 'private',
  group = 'group',
  supergroup = 'supergroup',
  channel = 'channel',
}

export class Middleware {
  constructor(private telegrafResponse: TelegrafResponseService) {}

  public verifyChatType = async (ctx: ContextMessageUpdate, next: () => {}) => {
    if (ctx.chat.type === ChatType.private && !ctx.update.callback_query) {
      return this.telegrafResponse.rejectPrivateChat(ctx);
    }

    return next();
  };
}
