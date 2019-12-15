import { Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { Actions } from '../constants/enums';

export const getApproveKeyboard = (): ExtraReplyMessage => {
  return Markup.inlineKeyboard([
    [Markup.callbackButton('Перевибрати активності 🔁', Actions.Restart)],
    [Markup.callbackButton('Підтвердити ✅', Actions.Approve)],
  ])
    .oneTime(true)
    .resize()
    .extra();
};
