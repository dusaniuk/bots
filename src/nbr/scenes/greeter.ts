import { BaseScene, SceneContextMessageUpdate, Stage } from 'telegraf';

import { getActivitiesKeyboard, getApproveKeyboard } from '../keyboards';
import { Actions } from '../constants/enums';
import { ACTIVITIES } from '../constants/titles';

export const genGreeterScene = (): BaseScene<SceneContextMessageUpdate> => {
  const greeter = new BaseScene('greeter');
  greeter.hears('abort', Stage.leave());

  const getSelectedActivitiesMsg = (activities: string[] = []): string => {
    return activities.reduce((msg, activity) => {
      const normalizedActivity = ACTIVITIES[activity].split(' ')[0];
      return msg === '' ? normalizedActivity : `${msg}, ${normalizedActivity}`;
    }, '');
  };

  greeter.enter(async (ctx: SceneContextMessageUpdate) => {
    const keyboard = await getActivitiesKeyboard();
    await ctx.reply('Вибери з меню активності, які тебе цікавлять', keyboard);
  });

  greeter.action(Actions.Save, async (ctx: SceneContextMessageUpdate) => {
    await ctx.deleteMessage();

    const activitiesMsg = getSelectedActivitiesMsg((ctx.scene.state as any).activities);
    const keyboard = getApproveKeyboard();
    await ctx.replyWithMarkdown(`Твої вибрані активності: *${activitiesMsg}*.`, keyboard);
  });

  greeter.action(Actions.Approve, async (ctx: SceneContextMessageUpdate) => {
    await ctx.deleteMessage();

    const activitiesMsg = getSelectedActivitiesMsg((ctx.scene.state as any).activities);

    await ctx.replyWithMarkdown(`Твої вибрані активності: *${activitiesMsg}*.`);
    await ctx.reply('Налаштування успішно збережені');

    await ctx.scene.leave();
  });

  greeter.action(Actions.Restart, async (ctx: SceneContextMessageUpdate) => {
    await ctx.deleteMessage();
    ctx.scene.state = {
      activities: [],
    };
    await ctx.scene.reenter();
  });

  greeter.action(/^.*$/, async (ctx: SceneContextMessageUpdate) => {
    const { activities } = ctx.scene.state as any;
    activities.push(ctx.callbackQuery.data);

    const keyboard = getActivitiesKeyboard(activities);
    await ctx.editMessageText('Вибери з меню активності, які тебе цікавлять', keyboard);
  });

  return greeter;
};
