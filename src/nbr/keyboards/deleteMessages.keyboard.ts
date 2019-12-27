import { CallbackButton, Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { MessageMetadata } from '../models/messages';

export const getDeleteMessagesKeyboard = (metadata: MessageMetadata[]): ExtraReplyMessage => {
  const buttons: CallbackButton[][] = metadata.map((data: MessageMetadata) => [Markup.callbackButton(data.topic, `delete ${data.id}`)]).reverse();

  return Markup.inlineKeyboard(buttons)
    .oneTime(true)
    .extra();
};
