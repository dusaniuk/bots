import { Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../../shared/interfaces';
import { AdminCatchDecision } from '../constants/admin-catch-decision';


export const getApproveKeyboard = ({ i18n, chat }: AppContext, catchId: string): ExtraReplyMessage => {
  return Markup.inlineKeyboard([
    Markup.callbackButton(i18n.t('other.yes'), `${AdminCatchDecision.Approve} ${catchId} ${chat.id}`),
    Markup.callbackButton(i18n.t('other.no'), `${AdminCatchDecision.Reject} ${catchId} ${chat.id}`),
  ])
    .oneTime(true)
    .extra();
};
