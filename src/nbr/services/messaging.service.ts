import { ExtraEditMessage } from 'telegraf/typings/telegram-types';

import { AppContext } from '../models/appContext';
import { MessageKey } from '../models/messages';
import { CONFIG } from '../../config';

const MARKDOWN_EXTRA: ExtraEditMessage = { parse_mode: 'Markdown', disable_notification: CONFIG.isDevMode };

export class MessagingService {
  sendMessages = (ctx: AppContext, userIds: number[], text: string): Promise<MessageKey[]> => {
    return Promise.all(
      userIds.map(
        async (userId: number): Promise<MessageKey> => {
          const message = await ctx.telegram.sendMessage(userId, text, MARKDOWN_EXTRA);

          return { chatId: userId, messageId: message.message_id };
        },
      ),
    );
  };
}
