import { CallbackButton, Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { Actions } from '../constants/enums';
import { AppContext } from '../../shared/interfaces/appContext';
import { getTitleWithEmoji } from '../utils/title.utils';
import { ActivitiesPreferences } from '../models/activities';
import { getActivitiesKeys } from '../utils/activities.utils';

export const getActivitiesKeyboard = (ctx: AppContext, preferences: ActivitiesPreferences = {}): ExtraReplyMessage => {
  const buttons: CallbackButton[][] = [];

  const activitiesKeys = getActivitiesKeys();
  activitiesKeys.forEach((key: string) => {
    let title = getTitleWithEmoji(ctx, key);
    const isSelected = preferences[key];
    if (isSelected) {
      title = `✅ ${title}`;
    }

    buttons.push([Markup.callbackButton(title, key)]);
  });

  const next: Actions = Actions.Next;
  buttons.push([Markup.callbackButton(getTitleWithEmoji(ctx, next), next)]);

  return Markup.inlineKeyboard(buttons)
    .resize()
    .extra();
};
