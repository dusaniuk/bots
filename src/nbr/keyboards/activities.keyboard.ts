import { CallbackButton, Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { Actions, Activity } from '../constants/enums';
import { AppContext } from '../../shared/models/appContext';
import { getTitleWithEmoji } from '../utils/title.utils';

export const getActivitiesKeyboard = (ctx: AppContext, activities: string[] = []): ExtraReplyMessage => {
  const buttons: CallbackButton[][] = [];

  Object.keys(Activity).forEach((key: string) => {
    const value = Activity[key];
    let title = getTitleWithEmoji(ctx, value);

    if (activities.includes(value)) {
      title = `✅ ${title}`;
    }

    buttons.push([Markup.callbackButton(title, value)]);
  });

  const next: Actions = Actions.Next;
  buttons.push([Markup.callbackButton(getTitleWithEmoji(ctx, next), next)]);

  return Markup.inlineKeyboard(buttons)
    .resize()
    .extra();
};
