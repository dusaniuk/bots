import { BaseScene, Stage } from 'telegraf';
import { firestore } from 'firebase-admin';

import { Actions, Activity } from '../constants/enums';
import { getActivitiesKeyboard, getApproveKeyboard } from '../keyboards';
import { ActivitiesService } from '../services/activities.service';
import { extractSelectedActivities, stringifySelectedActivities } from '../utils/activities.utils';
import { AppContext } from '../../shared/models/appContext';
import { ActivitiesPreferences } from '../models/activities';

interface ActivitiesState {
  preferences: ActivitiesPreferences;
}

export class ActivitiesScene {
  private readonly activitiesService: ActivitiesService;

  public static ID: string = 'activities';

  public scene: BaseScene<AppContext>;

  constructor(private db: firestore.Firestore) {
    this.activitiesService = new ActivitiesService(db);

    this.scene = new BaseScene(ActivitiesScene.ID);

    this.attachHookListeners();
  }

  private attachHookListeners = () => {
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
    await this.activitiesService.save(ctx.from.id, activities);

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
