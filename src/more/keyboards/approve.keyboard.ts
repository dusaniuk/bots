import { Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../shared/models/appContext';
import { Actions } from '../constants/actions';

export const getApproveKeyboard = ({ i18n, chat }: AppContext, captureId: string): ExtraReplyMessage => {
  return Markup.inlineKeyboard([
    Markup.callbackButton(i18n.t('other.yes'), `${Actions.ApproveCapture} ${captureId} ${chat.id}`),
    Markup.callbackButton(i18n.t('other.no'), `${Actions.RejectCapture} ${captureId} ${chat.id}`),
  ])
    .oneTime(true)
    .extra();
};
