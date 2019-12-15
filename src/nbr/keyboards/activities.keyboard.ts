import { CallbackButton, Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { ACTIONS, ACTIVITIES } from '../constants/titles';
import { Actions } from '../constants/enums';

export const getActivitiesKeyboard = (activities: string[] = []): ExtraReplyMessage => {
  const buttons: CallbackButton[][] = [];

  Object.keys(ACTIVITIES).forEach((key: string) => {
    if (activities.includes(key)) {
      return;
    }

    buttons.push([Markup.callbackButton(ACTIVITIES[key], key)]);
  });

  const save: Actions = Actions.Save;
  buttons.push([Markup.callbackButton(ACTIONS[save], save)]);

  return Markup.inlineKeyboard(buttons)
    .resize()
    .extra();
};
