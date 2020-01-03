import { Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../shared/models/appContext';
import { CallbackQueryType } from '../constants/callbackQueryType';

export const getApproveKeyboard = ({ i18n, chat }: AppContext, captureId: string): ExtraReplyMessage => {
  return Markup.inlineKeyboard([
    Markup.callbackButton(i18n.t('other.yes'), `${CallbackQueryType.capture} approve ${captureId} ${chat.id}`),
    Markup.callbackButton(i18n.t('other.no'), `${CallbackQueryType.capture} reject ${captureId} ${chat.id}`),
  ])
    .oneTime(true)
    .extra();
};
