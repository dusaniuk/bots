import { Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../shared/interfaces';
import { Actions } from '../constants/actions';

export const getApproveKeyboard = ({ i18n, chat }: AppContext, catchId: string): ExtraReplyMessage => {
  return Markup.inlineKeyboard([
    Markup.callbackButton(i18n.t('other.yes'), `${Actions.ApproveCatch} ${catchId} ${chat.id}`),
    Markup.callbackButton(i18n.t('other.no'), `${Actions.RejectCatch} ${catchId} ${chat.id}`),
  ])
    .oneTime(true)
    .extra();
};
