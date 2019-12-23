import { BaseScene, Stage } from 'telegraf';
import { firestore } from 'firebase-admin';

import { getActivitiesKeyboard, getApproveKeyboard } from '../keyboards';
import { Actions, Activity } from '../constants/enums';
import { getNormalizedActivities } from '../utils/activities.utils';
import { ActivitiesService } from '../services/activities.service';
import { AppContext } from '../models/appContext';
import { CONFIG } from '../../config';

interface AnnounceState {
  activities: string[];
  isListeningForMessage: boolean;
  message: string;
}

export class AnnounceScene {
  private readonly activitiesService: ActivitiesService;

  public static ID: string = 'announce';

  public scene: BaseScene<AppContext>;

  constructor(private db: firestore.Firestore) {
    this.activitiesService = new ActivitiesService(db);

    this.scene = new BaseScene(AnnounceScene.ID);
    this.scene.hears('abort', Stage.leave());

    this.attachHookListeners();
  }

  private attachHookListeners = () => {
    this.scene.enter(this.enter);
    this.scene.on('message', this.onMessage);

    this.scene.action(Actions.Next, this.listenForMessage);
    this.scene.action(Actions.Approve, this.approveSelectedActivities);
    this.scene.action(Actions.Restart, this.restartActivitiesSelection);

    this.scene.action(Activity.All, this.handleAllSelection);
    this.scene.action(/^.*$/, this.handleActivitySelection);
  };

  private enter = async (ctx: AppContext) => {
    this.dropState(ctx);

    await ctx.replyWithMarkdown(ctx.i18n.t('announce.intro'));

    const keyboard = getActivitiesKeyboard(ctx);
    await ctx.reply(ctx.i18n.t('announce.chooseActivities'), keyboard);
  };

  private listenForMessage = async (ctx: AppContext) => {
    await ctx.deleteMessage();
    await ctx.reply(ctx.i18n.t('announce.requestMessage'));

    this.getState(ctx).isListeningForMessage = true;
  };

  private approveSelectedActivities = async (ctx: AppContext) => {
    await ctx.deleteMessage();
    await ctx.reply(ctx.i18n.t('announce.looking'));

    const activitiesData = await this.activitiesService.getAll();
    const state: AnnounceState = this.getState(ctx);

    const userIds: number[] = state.activities.reduce((acc: number[], activity: string) => {
      return [...acc, ...activitiesData[activity]];
    }, []);

    const userIdsSet: Set<number> = new Set(userIds);
    userIdsSet.delete(ctx.from.id);

    if (CONFIG.environment === 'dev') {
      userIdsSet.clear();
      userIdsSet.add(ctx.from.id);
    }

    const normalizedUserIdsList: number[] = Array.from(userIdsSet);

    if (normalizedUserIdsList.length === 0) {
      await ctx.reply(ctx.i18n.t('error.usersNotFound'));
      await ctx.scene.leave();
      return;
    }

    await ctx.reply(
      ctx.i18n.t('announce.startSending', {
        usersCount: normalizedUserIdsList.length,
      }),
    );

    await normalizedUserIdsList.forEach((userId: number) => {
      const resourceKey: string = ctx.from.username ? 'announce.message2' : 'announce.message';
      const message: string = ctx.i18n.t(resourceKey, {
        user: `${ctx.from.first_name} ${ctx.from.last_name || ''}`,
        activities: getNormalizedActivities(ctx, state.activities),
        message: state.message,
      });

      return ctx.telegram.sendMessage(userId, message, {
        parse_mode: 'Markdown',
      });
    });

    await ctx.reply(ctx.i18n.t('announce.sent'));
    await ctx.scene.leave();
  };

  private restartActivitiesSelection = async (ctx: AppContext) => {
    this.dropState(ctx);

    await ctx.deleteMessage();
    await ctx.scene.reenter();
  };

  private handleAllSelection = async (ctx: AppContext) => {
    const { activities } = this.getState(ctx);
    activities.length = 0;
    activities.push(ctx.callbackQuery.data);

    await this.listenForMessage(ctx);
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
    await ctx.editMessageText(ctx.i18n.t('announce.chooseActivities'), keyboard);
  };

  private onMessage = async (ctx: AppContext) => {
    const state: AnnounceState = this.getState(ctx);
    if (!state.isListeningForMessage) {
      return;
    }

    state.message = ctx.message.text;
    state.isListeningForMessage = false;

    const activitiesText = getNormalizedActivities(ctx, state.activities);
    const keyboard = getApproveKeyboard(ctx);

    const isAnnouncingForAllMembers = state.activities.length === 1 && state.activities[0] === Activity.All;
    const msgKey = isAnnouncingForAllMembers ? 'confirmRequestToAll' : 'confirmRequest';

    const msg: string = ctx.i18n.t(`announce.${msgKey}`, {
      activities: activitiesText,
      message: state.message,
    });
    await ctx.replyWithMarkdown(msg, keyboard);
  };

  private getState = (ctx: AppContext): AnnounceState => {
    return ctx.scene.state as AnnounceState;
  };

  private dropState = (ctx: AppContext): void => {
    ctx.scene.state = {
      activities: [],
      isListeningForMessage: false,
    };
  };
}
