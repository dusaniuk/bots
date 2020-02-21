import { Stage } from 'telegraf';
import { inject, injectable } from 'inversify';

import { Actions, Activity, Scene } from '../constants/enums';
import { getActivitiesKeyboard, getApproveKeyboard } from '../keyboards';
import { extractSelectedActivities, stringifySelectedActivities } from '../utils/activities.utils';
import { AppContext } from '../../../shared/interfaces';
import { ActivitiesPreferences } from '../../core/interfaces/activities';
import { TYPES } from '../../types';

import { ActivitiesStore } from '../../core/interfaces/store';
import { TelegramScene } from '../interfaces/telegramScene';

interface ActivitiesState {
  preferences: ActivitiesPreferences;
}

@injectable()
export class ActivitiesScene extends TelegramScene {
  constructor(
    @inject(TYPES.ACTIVITIES_STORE) private activitiesStore: ActivitiesStore,
  ) {
    super(Scene.Activities);
  }

  protected attachHookListeners = (): void => {
    this.scene.enter(this.onEnterScene);
    this.scene.action(Actions.Next, this.onNext);
    this.scene.action(Actions.Approve, this.onApprove);
    this.scene.action(Actions.Restart, this.onRestart);

    this.scene.action(Activity.All, this.onSelectAll);
    this.scene.action(/^.*$/, this.onSelectActivity);

    this.scene.hears('abort', Stage.leave());
  };

  private onEnterScene = async (ctx: AppContext) => {
    this.dropState(ctx);

    const keyboard = await getActivitiesKeyboard(ctx);
    await ctx.reply(ctx.i18n.t('activities.intro'), keyboard);
  };

  // TODO: consider joining this logic with announce.scene
  private onSelectActivity = async (ctx: AppContext) => {
    const { preferences } = this.getState(ctx);

    const toggledActivity = ctx.callbackQuery.data;
    preferences[toggledActivity] = !preferences[toggledActivity];

    const keyboard = getActivitiesKeyboard(ctx, preferences);
    await ctx.editMessageText(ctx.i18n.t('activities.intro'), keyboard);
  };

  private onSelectAll = async (ctx: AppContext) => {
    const { preferences } = this.getState(ctx);
    preferences[Activity.All] = true;

    await this.onNext(ctx);
  };

  private onNext = async (ctx: AppContext) => {
    await ctx.deleteMessage();

    const { preferences } = this.getState(ctx);

    const msg: string = ctx.i18n.t('activities.selectedSummary', {
      activities: stringifySelectedActivities(ctx, preferences),
    });

    await ctx.replyWithMarkdown(msg, getApproveKeyboard(ctx));
  };

  private onRestart = async (ctx: AppContext) => {
    await ctx.deleteMessage();
    await ctx.scene.reenter();
  };

  private onApprove = async (ctx: AppContext) => {
    await ctx.deleteMessage();

    const { preferences } = this.getState(ctx);

    const msg = ctx.i18n.t('activities.selectedSummary', {
      activities: stringifySelectedActivities(ctx, preferences),
    });

    await ctx.replyWithMarkdown(msg);

    const savingMsg = await ctx.reply(ctx.i18n.t('activities.saving'));
    const activities = extractSelectedActivities(preferences);
    await this.activitiesStore.save(ctx.from.id, activities);

    await ctx.telegram.deleteMessage(savingMsg.chat.id, savingMsg.message_id);
    await ctx.reply(ctx.i18n.t('activities.saved'));

    await ctx.scene.leave();
  };

  private getState = (ctx: AppContext): ActivitiesState => {
    return ctx.scene.state as ActivitiesState;
  };

  private dropState = (ctx: AppContext): void => {
    ctx.scene.state = {
      preferences: {},
    } as ActivitiesState;
  };
}
