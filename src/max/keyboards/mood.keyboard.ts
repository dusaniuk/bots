import { CallbackButton, Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../shared/models/appContext';
import { Mood } from '../constants/mood';

export const getMoodKeyboard = ({ i18n, chat }: AppContext): ExtraReplyMessage => {
  const buttons: CallbackButton[][] = Object.keys(Mood)
    .map(k => Mood[k])
    .map((key: string) => [Markup.callbackButton(i18n.t(`mood.${key}`), key)]);

  return Markup.inlineKeyboard(buttons)
    .oneTime(true)
    .extra();
};
