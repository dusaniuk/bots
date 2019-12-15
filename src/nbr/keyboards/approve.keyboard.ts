import { Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { Actions } from '../constants/enums';

export const getApproveKeyboard = (): ExtraReplyMessage => {
  return Markup.inlineKeyboard([
    [Markup.callbackButton('Підтвердити ✅', Actions.Approve)],
    [Markup.callbackButton('Перевибрати активності 🔁', Actions.Restart)],
  ])
    .oneTime(true)
    .resize()
    .extra();
};
