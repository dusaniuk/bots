import { BaseScene, Stage } from 'telegraf';
import { firestore } from 'firebase-admin';

import { getActivitiesKeyboard, getApproveKeyboard } from '../keyboards';
import { Actions, Activity } from '../constants/enums';
import { getNormalizedActivities } from '../utils/activities.utils';
import { ActivitiesService } from '../services/activities.service';
import { AppContext } from '../models/appContext';
import { CONFIG } from '../../config';
import { UsersService } from '../services/users.service';

interface AnnounceState {
  activities: string[];
  isListeningForMessage: boolean;
  message: string;
}

export class AnnounceScene {
  private readonly activitiesService: ActivitiesService;
  private readonly usersService: UsersService;

  public static ID: string = 'announce';

  public scene: BaseScene<AppContext>;

  constructor(private db: firestore.Firestore) {
    this.activitiesService = new ActivitiesService(db);
    this.usersService = new UsersService(db);

    this.scene = new BaseScene(AnnounceScene.ID);
    this.scene.hears('abort', Stage.leave());

    this.attachHookListeners();
  }

  private attachHookListeners = () => {
    this.scene.enter(this.onEnterScene);
    this.scene.on('message', this.onMessage);

    this.scene.action(Actions.Next, this.onNext);
    this.scene.action(Actions.Approve, this.onApprove);
    this.scene.action(Actions.Restart, this.onRestart);

    this.scene.action(Activity.All, this.onSelectAll);
    this.scene.action(/^.*$/, this.onSelectActivity);
  };

  private onEnterScene = async (ctx: AppContext): Promise<void> => {
    this.dropState(ctx);

    if (!this.isAllowedToAnnounce(ctx.from.id)) {
      await ctx.reply(ctx.i18n.t('announce.prohibited'));
      await ctx.scene.leave();
      return;
    }

    await ctx.replyWithMarkdown(ctx.i18n.t('announce.intro'));

    const keyboard = getActivitiesKeyboard(ctx);
    await ctx.reply(ctx.i18n.t('announce.chooseActivities'), keyboard);
  };

  private onSelectActivity = async (ctx: AppContext): Promise<void> => {
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

  private onSelectAll = async (ctx: AppContext): Promise<void> => {
    const { activities } = this.getState(ctx);
    activities.length = 0;

    const activitiesList: string[] = Object.keys(Activity).map(k => Activity[k]);
    activities.push(...activitiesList);

    await this.onNext(ctx);
  };

  private onNext = async (ctx: AppContext): Promise<void> => {
    await ctx.deleteMessage();
    await ctx.reply(ctx.i18n.t('announce.requestMessage'));

    this.getState(ctx).isListeningForMessage = true;
  };

  private onMessage = async (ctx: AppContext): Promise<void> => {
    const state: AnnounceState = this.getState(ctx);
    if (!state.isListeningForMessage) {
      return;
    }

    state.message = ctx.message.text;
    state.isListeningForMessage = false;

    const isAnnouncingForAllMembers = state.activities.includes(Activity.All);
    const msgKey = isAnnouncingForAllMembers ? 'confirmRequestToAll' : 'confirmRequest';

    const msg: string = ctx.i18n.t(`announce.${msgKey}`, {
      activities: getNormalizedActivities(ctx, state.activities),
      message: state.message,
    });

    const keyboard = getApproveKeyboard(ctx);
    await ctx.replyWithMarkdown(msg, keyboard);
  };

  private onRestart = async (ctx: AppContext): Promise<void> => {
    this.dropState(ctx);

    await ctx.deleteMessage();
    await ctx.scene.reenter();
  };

  private onApprove = async (ctx: AppContext): Promise<void> => {
    await ctx.deleteMessage();
    await ctx.reply(ctx.i18n.t('announce.looking'));

    const { activities, message }: AnnounceState = this.getState(ctx);

    const userIds = await this.getUserIdsForActivities(activities, ctx.from.id);

    if (userIds.length === 0) {
      await ctx.reply(ctx.i18n.t('error.usersNotFound'));
      await ctx.scene.leave();
      return;
    }

    await ctx.reply(ctx.i18n.t('announce.startSending', { usersCount: userIds.length }));

    const finalizedMessage: string = ctx.i18n.t('announce.message', {
      user: this.stringifyUserGreeting(ctx),
      activities: getNormalizedActivities(ctx, activities),
      message,
    });

    await userIds.forEach((userId: number) => {
      return ctx.telegram.sendMessage(userId, finalizedMessage, {
        parse_mode: 'Markdown',
      });
    });

    await ctx.reply(ctx.i18n.t('announce.sent'));
    await ctx.scene.leave();
  };

  // helpers
  private getUserIdsForActivities = async (activities: string[], senderId: number): Promise<number[]> => {
    if (CONFIG.environment === 'dev') {
      return [senderId];
    }

    const activitiesData = await this.activitiesService.getAll();

    const userIds: number[] = activities.reduce((acc: number[], activity: string) => {
      return [...acc, ...activitiesData[activity]];
    }, []);

    const userIdsSet: Set<number> = new Set(userIds);
    userIdsSet.delete(senderId);

    return Array.from(userIdsSet);
  };

  private isAllowedToAnnounce = async (userId: number): Promise<boolean> => {
    const user = await this.usersService.getUser(userId.toString());

    return !!user.allowedToAnnounce;
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

  private stringifyUserGreeting = ({ from }: AppContext): string => {
    const user = `*${from.first_name} ${from.last_name || ''}*`;

    return from.username ? `${user} (@${from.username})` : user;
  };
}
