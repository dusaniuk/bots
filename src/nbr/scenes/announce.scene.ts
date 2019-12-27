import { BaseScene, Stage } from 'telegraf';
import { firestore } from 'firebase-admin';

import { CONFIG } from '../../config';
import { getActivitiesKeyboard, getApproveKeyboard } from '../keyboards';
import { getNormalizedActivities } from '../utils/activities.utils';
import { stringifyUserGreeting } from '../utils/user.utils';
import { ActivitiesService } from '../services/activities.service';
import { MessagingService } from '../services/messaging.service';
import { UsersService } from '../services/users.service';
import { Actions, Activity } from '../constants/enums';
import { AppContext } from '../models/appContext';
import { MessageKey } from '../models/messages';

interface AnnounceState {
  activities: string[];
  isListeningForMessage: boolean;
  isListeningForTopic: boolean;
  message: string;
  topic: string;
}

export class AnnounceScene {
  private readonly activitiesService: ActivitiesService;
  private readonly messagingService: MessagingService;
  private readonly usersService: UsersService;

  public static ID: string = 'announce';

  public scene: BaseScene<AppContext>;

  private messageText: string;

  constructor(private db: firestore.Firestore) {
    this.activitiesService = new ActivitiesService(db);
    this.messagingService = new MessagingService(db);
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
    await ctx.reply(ctx.i18n.t('announce.requestTopic'));

    this.getState(ctx).isListeningForTopic = true;
  };

  private onMessage = async (ctx: AppContext): Promise<void> => {
    const state: AnnounceState = this.getState(ctx);

    if (!state.isListeningForTopic && !state.isListeningForMessage) {
      return;
    }

    if (state.isListeningForTopic) {
      state.topic = ctx.message.text;
      state.isListeningForTopic = false;
      state.isListeningForMessage = true;

      await ctx.reply(ctx.i18n.t('announce.requestMessage'));
      return;
    }

    if (state.isListeningForMessage) {
      state.message = ctx.message.text;
      state.isListeningForMessage = false;
    }

    this.messageText = ctx.i18n.t('announce.message', {
      user: stringifyUserGreeting(ctx),
      activities: getNormalizedActivities(ctx, state.activities),
      message: state.message,
      topic: state.topic,
    });

    await ctx.replyWithMarkdown(ctx.i18n.t('announce.confirmAnnounce', { messageText: this.messageText }), getApproveKeyboard(ctx));
  };

  private onRestart = async (ctx: AppContext): Promise<void> => {
    this.dropState(ctx);

    await ctx.deleteMessage();
    await ctx.scene.reenter();
  };

  private onApprove = async (ctx: AppContext): Promise<void> => {
    await ctx.deleteMessage();
    await ctx.reply(ctx.i18n.t('announce.looking'));

    const { activities, topic }: AnnounceState = this.getState(ctx);

    const userIds = await this.getUserIdsForActivities(activities, ctx.from.id);

    if (userIds.length === 0) {
      await ctx.reply(ctx.i18n.t('error.usersNotFound'));
      await ctx.scene.leave();
      return;
    }

    await ctx.reply(ctx.i18n.t('announce.startSending', { usersCount: userIds.length }));

    const keys: MessageKey[] = await this.messagingService.sendMessages(ctx, userIds, this.messageText);
    await this.saveMessageMetadata(topic, keys);

    await ctx.reply(ctx.i18n.t('announce.sent'));
    await ctx.scene.leave();
  };

  // helpers
  private saveMessageMetadata = (topic: string, messageKeys: MessageKey[]): Promise<void> => {
    return this.messagingService.saveMessageMetadata({
      messageText: this.messageText,
      timestamp: new Date().getTime(),
      messageKeys,
      topic,
    });
  };

  private getUserIdsForActivities = async (activities: string[], senderId: number): Promise<number[]> => {
    if (CONFIG.isDevMode) {
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
      isListeningForTopic: false,
      message: '',
      topic: '',
    };
  };
}
