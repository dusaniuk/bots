import { Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { Actions } from '../constants/enums';
import { AppContext } from '../../../shared/interfaces';

export const getApproveKeyboard = ({ i18n }: AppContext): ExtraReplyMessage => {
  return Markup.inlineKeyboard([
    [Markup.callbackButton(i18n.t('title.restart'), Actions.Restart)],
    [Markup.callbackButton(i18n.t('title.approve'), Actions.Approve)],
  ])
    .oneTime(true)
    .extra();
};
