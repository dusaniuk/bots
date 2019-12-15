import { BaseScene, SceneContextMessageUpdate, Stage } from 'telegraf';

import { getActivitiesKeyboard, getApproveKeyboard } from '../keyboards';
import { Actions } from '../constants/enums';
import { ACTIVITIES } from '../constants/titles';

interface GreeterState {
  activities: string[];
}

export class GreeterScene {
  public static ID: string = 'greeter';

  public scene: BaseScene<SceneContextMessageUpdate>;

  constructor() {
    this.scene = new BaseScene(GreeterScene.ID);
    this.scene.hears('abort', Stage.leave());

    this.attachHookListeners();
  }

  private attachHookListeners = () => {
    this.scene.enter(this.enter);
    this.scene.action(Actions.Save, this.saveActivities);
    this.scene.action(Actions.Approve, this.approveSelectedActivities);
    this.scene.action(Actions.Restart, this.restartActivitiesSelection);
    this.scene.action(/^.*$/, this.handleActivitySelection);
  };

  private enter = async (ctx: SceneContextMessageUpdate) => {
    const keyboard = await getActivitiesKeyboard();
    await ctx.reply('Вибери з меню активності, які тебе цікавлять', keyboard);
  };

  private saveActivities = async (ctx: SceneContextMessageUpdate) => {
    await ctx.deleteMessage();

    const { activities } = this.getState(ctx);
    const activitiesMsg = this.getSelectedActivitiesMsg(activities);

    const keyboard = getApproveKeyboard();
    await ctx.replyWithMarkdown(`Твої вибрані активності: *${activitiesMsg}*.`, keyboard);
  };

  private approveSelectedActivities = async (ctx: SceneContextMessageUpdate) => {
    await ctx.deleteMessage();

    const { activities } = this.getState(ctx);
    const activitiesMsg = this.getSelectedActivitiesMsg(activities);

    await ctx.replyWithMarkdown(`Твої вибрані активності: *${activitiesMsg}*.`);
    await ctx.reply('Налаштування успішно збережені');

    await ctx.scene.leave();
  };

  private restartActivitiesSelection = async (ctx: SceneContextMessageUpdate) => {
    this.dropState(ctx);

    await ctx.deleteMessage();
    await ctx.scene.reenter();
  };

  private handleActivitySelection = async (ctx: SceneContextMessageUpdate) => {
    const { activities } = this.getState(ctx);
    activities.push(ctx.callbackQuery.data);

    const keyboard = getActivitiesKeyboard(activities);
    await ctx.editMessageText('Вибери з меню активності, які тебе цікавлять', keyboard);
  };

  private getState = (ctx: SceneContextMessageUpdate): GreeterState => {
    return ctx.scene.state as GreeterState;
  };

  private dropState = (ctx: SceneContextMessageUpdate): void => {
    ctx.scene.state = {
      activities: [],
    };
  };

  private getSelectedActivitiesMsg = (activities: string[] = []): string => {
    return activities.reduce((msg, activity) => {
      const normalizedActivity = ACTIVITIES[activity].split(' ')[0];
      return msg === '' ? normalizedActivity : `${msg}, ${normalizedActivity}`;
    }, '');
  };
}
