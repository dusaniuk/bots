import { BaseScene, SceneContextMessageUpdate, Stage } from 'telegraf';
import { firestore } from 'firebase-admin';
import { getActivitiesKeyboard, getApproveKeyboard } from '../keyboards';
import { Actions } from '../constants/enums';
import { getNormalizedActivities } from '../utils/activities.utils';
import { ActivitiesService } from '../services/activities.service';

interface AnnounceState {
  activities: string[];
  isListeningForMessage: boolean;
  message: string;
}

export class AnnounceScene {
  private readonly activitiesService: ActivitiesService;

  public static ID: string = 'announce';

  public scene: BaseScene<SceneContextMessageUpdate>;

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
    this.scene.action(/^.*$/, this.handleActivitySelection);
  };

  private enter = async (ctx: SceneContextMessageUpdate) => {
    this.dropState(ctx);

    await ctx.replyWithMarkdown(`Маєш що сказати, *${ctx.from.first_name}?* 🙃`);

    const keyboard = getActivitiesKeyboard();
    await ctx.reply('Ну добре, вибери активності, кому має прийти твоє повідомлення:', keyboard);
  };

  private listenForMessage = async (ctx: SceneContextMessageUpdate) => {
    await ctx.deleteMessage();
    await ctx.reply('Напиши текст самого повідомлення (де/на скільки буде збір, певні умови, відміна івенту, тд):');

    this.getState(ctx).isListeningForMessage = true;
  };

  private approveSelectedActivities = async (ctx: SceneContextMessageUpdate) => {
    await ctx.deleteMessage();
    await ctx.reply('Шукаю всіх людей...');

    const activitiesData = await this.activitiesService.getAll();
    const state: AnnounceState = this.getState(ctx);

    const userIds: number[] = state.activities.reduce((acc: number[], activity: string) => {
      return [...acc, ...activitiesData[activity]];
    }, []);

    const userIdsSet: Set<number> = new Set(userIds);
    userIdsSet.delete(ctx.from.id);

    const normalizedUserIdsList: number[] = Array.from(userIdsSet);

    if (normalizedUserIdsList.length === 0) {
      await ctx.reply('На превеликий жаль, у вибраних тобою категоріях не знайшлось людей... 😢');
      await ctx.reply("Якщо ти думаєш що це помилка - зв'яжись з адміністратором бота, він спробує розібратись в чому біда");

      await ctx.scene.leave();
      return;
    }

    await ctx.reply(`Розпочинаю розсилку наступній кількості людей: ${normalizedUserIdsList.length}`);

    await normalizedUserIdsList.forEach((userId: number) => {
      return ctx.telegram.sendMessage(userId, state.message);
    });

    await ctx.reply('Повідомлення успішно розіслано ✅');
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
    await ctx.editMessageText('Ну добре, вибери активності, кому має прийти твоє повідомлення:', keyboard);
  };

  private onMessage = async (ctx: SceneContextMessageUpdate) => {
    const state: AnnounceState = this.getState(ctx);
    if (!state.isListeningForMessage) {
      return;
    }

    state.message = ctx.message.text;
    state.isListeningForMessage = false;

    const activitiesText = getNormalizedActivities(state.activities);
    const keyboard = getApproveKeyboard();

    await ctx.replyWithMarkdown(`Окєй, моя задача відправити всім людям з: *${activitiesText}* наступне повідомлення:\n${state.message}`, keyboard);
  };

  private getState = (ctx: SceneContextMessageUpdate): AnnounceState => {
    return ctx.scene.state as AnnounceState;
  };

  private dropState = (ctx: SceneContextMessageUpdate): void => {
    ctx.scene.state = {
      activities: [],
      isListeningForMessage: false,
    };
  };
}
