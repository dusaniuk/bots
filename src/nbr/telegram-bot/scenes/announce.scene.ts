import { Stage } from 'telegraf';
import { inject, injectable } from 'inversify';

import { CONFIG } from '../../../config';
import { getActivitiesKeyboard, getApproveKeyboard } from '../keyboards';
import {
  extractSelectedActivities,
  getActivitiesKeys,
  stringifySelectedActivities,
} from '../utils/activities.utils';
import { stringifyUserGreeting } from '../utils/user.utils';
import { Actions, Activity, Scene } from '../constants/enums';
import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';
import { ActivitiesStore, MessageStore, UsersStore } from '../../core/interfaces/store';
import { ActivitiesPreferences } from '../../core/interfaces/activities';
import { MessageKey } from '../../core/interfaces/messages';
import { TelegramScene } from '../interfaces/telegramScene';


export interface AnnounceState {
  preferences: ActivitiesPreferences;
  isListeningForMessage: boolean;
  isListeningForTopic: boolean;
  message: string;
  topic: string;
}


@injectable()
export class AnnounceScene extends TelegramScene {
  private messageText: string;

  constructor(
    @inject(TYPES.ACTIVITIES_STORE) private activitiesStore: ActivitiesStore,
    @inject(TYPES.MESSAGE_STORE) private messageStore: MessageStore,
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
  ) {
    super(Scene.Announce);
  }

  protected attachHookListeners = (): void => {
    this.scene.enter(this.onEnterScene);
    this.scene.on('message', this.onMessage);

    this.scene.action(Actions.Next, this.onNext);
    this.scene.action(Actions.Approve, this.onApprove);
    this.scene.action(Actions.Restart, this.onRestart);

    this.scene.action(Activity.All, this.onSelectAll);
    this.scene.action(/^.*$/, this.onSelectActivity);

    this.scene.hears('abort', Stage.leave());
  };

  private onEnterScene = async (ctx: AppContext): Promise<void> => {
    this.dropState(ctx);

    const canAnnounce: boolean = await this.isAllowedToAnnounce(ctx.from.id);
    if (!canAnnounce) {
      await ctx.reply(ctx.i18n.t('announce.prohibited'));
      await ctx.scene.leave();
      return;
    }

    await ctx.replyWithMarkdown(ctx.i18n.t('announce.intro'));

    const keyboard = getActivitiesKeyboard(ctx);
    await ctx.reply(ctx.i18n.t('announce.chooseActivities'), keyboard);
  };

  // TODO: consider joining this logic with activities.scene
  private onSelectActivity = async (ctx: AppContext): Promise<void> => {
    const { preferences } = this.getState(ctx);

    const toggledActivity = ctx.callbackQuery.data;
    preferences[toggledActivity] = !preferences[toggledActivity];

    const keyboard = getActivitiesKeyboard(ctx, preferences);
    await ctx.editMessageText(ctx.i18n.t('announce.chooseActivities'), keyboard);
  };

  private onSelectAll = async (ctx: AppContext): Promise<void> => {
    const { preferences } = this.getState(ctx);

    const activitiesList: string[] = getActivitiesKeys();
    activitiesList.forEach((key: string) => {
      preferences[key] = true;
    });

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

    state.message = ctx.message.text;
    state.isListeningForMessage = false;

    this.messageText = ctx.i18n.t('announce.message', {
      user: stringifyUserGreeting(ctx),
      activities: stringifySelectedActivities(ctx, state.preferences),
      message: state.message,
      topic: state.topic,
    });

    try {
      await ctx.replyWithMarkdown(ctx.i18n.t('announce.confirmAnnounce', { messageText: this.messageText }), getApproveKeyboard(ctx));
    } catch (err) {
      await ctx.replyWithMarkdown(ctx.i18n.t('error.invalidMarkdown'));
      await ctx.scene.leave();
    }
  };

  private onRestart = async (ctx: AppContext): Promise<void> => {
    await ctx.deleteMessage();
    await ctx.scene.reenter();
  };

  private onApprove = async (ctx: AppContext): Promise<void> => {
    await ctx.deleteMessage();
    await ctx.reply(ctx.i18n.t('announce.looking'));

    const { preferences, topic }: AnnounceState = this.getState(ctx);

    const activities = extractSelectedActivities(preferences);
    const userIds = await this.getUserIdsForActivities(activities, ctx.from.id);

    if (userIds.length === 0) {
      await ctx.reply(ctx.i18n.t('error.usersNotFound'));
      await ctx.scene.leave();
      return;
    }

    await ctx.reply(ctx.i18n.t('announce.startSending', { usersCount: userIds.length }));

    const keys: MessageKey[] = await this.messageStore.sendMessages(ctx, userIds, this.messageText);
    await this.saveMessageMetadata(topic, keys);

    await ctx.reply(ctx.i18n.t('announce.sent'));
    await ctx.scene.leave();
  };

  // helpers
  private saveMessageMetadata = (topic: string, messageKeys: MessageKey[]): Promise<void> => {
    return this.messageStore.saveMessageMetadata({
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

    const activitiesData = await this.activitiesStore.getAll();

    const userIds: number[] = [...activities, Activity.All].reduce((acc: number[], activity: string) => {
      return [...acc, ...activitiesData[activity]];
    }, []);

    const userIdsSet: Set<number> = new Set(userIds);
    userIdsSet.delete(senderId);

    return Array.from(userIdsSet);
  };

  private isAllowedToAnnounce = async (userId: number): Promise<boolean> => {
    const user = await this.usersStore.getUser(userId.toString());

    return !!user.allowedToAnnounce;
  };

  private getState = (ctx: AppContext): AnnounceState => {
    return ctx.scene.state as AnnounceState;
  };

  private dropState = (ctx: AppContext): void => {
    ctx.scene.state = {
      preferences: {},
      isListeningForMessage: false,
      isListeningForTopic: false,
      message: '',
      topic: '',
    } as AnnounceState;
  };
}
