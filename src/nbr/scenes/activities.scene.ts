import { BaseScene, Stage } from 'telegraf';
import { firestore } from 'firebase-admin';

import { Actions, Activity } from '../constants/enums';
import { getActivitiesKeyboard, getApproveKeyboard } from '../keyboards';
import { ActivitiesService } from '../services/activities.service';
import { getNormalizedActivities } from '../utils/activities.utils';
import { AppContext } from '../../shared/models/appContext';

interface ActivitiesState {
  activities: string[];
}

export class ActivitiesScene {
  private readonly activitiesService: ActivitiesService;

  public static ID: string = 'activities';

  public scene: BaseScene<AppContext>;

  constructor(private db: firestore.Firestore) {
    this.activitiesService = new ActivitiesService(db);

    this.scene = new BaseScene(ActivitiesScene.ID);
    this.scene.hears('abort', Stage.leave());

    this.attachHookListeners();
  }

  private attachHookListeners = () => {
    this.scene.enter(this.enter);
    this.scene.action(Actions.Next, this.saveActivities);
    this.scene.action(Actions.Approve, this.approveSelectedActivities);
    this.scene.action(Actions.Restart, this.restartActivitiesSelection);

    this.scene.action(Activity.All, this.handleAllActivitySelection);
    this.scene.action(/^.*$/, this.handleActivitySelection);
  };

  private enter = async (ctx: AppContext) => {
    this.dropState(ctx);

    const keyboard = await getActivitiesKeyboard(ctx);
    await ctx.reply(ctx.i18n.t('activities.intro'), keyboard);
  };

  private saveActivities = async (ctx: AppContext) => {
    await ctx.deleteMessage();

    const { activities } = this.getState(ctx);
    const activitiesMsg = getNormalizedActivities(ctx, activities);

    const keyboard = getApproveKeyboard(ctx);

    const msg = ctx.i18n.t('activities.selectedSummary', {
      activities: activitiesMsg,
    });

    await ctx.replyWithMarkdown(msg, keyboard);
  };

  private approveSelectedActivities = async (ctx: AppContext) => {
    await ctx.deleteMessage();

    const { activities } = this.getState(ctx);
    const activitiesMsg = getNormalizedActivities(ctx, activities);

    const msg = ctx.i18n.t('activities.selectedSummary', {
      activities: activitiesMsg,
    });

    await ctx.replyWithMarkdown(msg);

    const tmpMsg = await ctx.reply(ctx.i18n.t('activities.saving'));

    await this.activitiesService.save(ctx.from.id, activities);

    await ctx.telegram.deleteMessage(tmpMsg.chat.id, tmpMsg.message_id);
    await ctx.reply(ctx.i18n.t('activities.saved'));

    await ctx.scene.leave();
  };

  private restartActivitiesSelection = async (ctx: AppContext) => {
    await ctx.deleteMessage();
    await ctx.scene.reenter();
  };

  private handleAllActivitySelection = async (ctx: AppContext) => {
    const { activities } = this.getState(ctx);
    activities.length = 0;
    activities.push(ctx.callbackQuery.data);

    await this.saveActivities(ctx);
  };

  private handleActivitySelection = async (ctx: AppContext) => {
    const { activities } = this.getState(ctx);

    const newActivity = ctx.callbackQuery.data;
    if (activities.includes(newActivity)) {
      activities.splice(activities.indexOf(newActivity), 1);
    } else {
      activities.push(newActivity);
    }

    const keyboard = getActivitiesKeyboard(ctx, activities);
    await ctx.editMessageText(ctx.i18n.t('activities.intro'), keyboard);
  };

  private getState = (ctx: AppContext): ActivitiesState => {
    return ctx.scene.state as ActivitiesState;
  };

  private dropState = (ctx: AppContext): void => {
    ctx.scene.state = {
      activities: [],
    };
  };
}
