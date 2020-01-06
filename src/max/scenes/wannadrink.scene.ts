import { BaseScene, Stage } from 'telegraf';

import { AppContext } from '../../shared/models/appContext';
import { getMoodKeyboard } from '../keyboards/mood.keyboard';
import * as helpers from '../utils/helpers';

interface WannaDrinkState {
  currentMood: string;
}

export class WannaDrinkScene {
  public static ID: string = 'wanna-drink';

  public scene: BaseScene<AppContext>;

  constructor() {
    this.scene = new BaseScene(WannaDrinkScene.ID);
    this.scene.hears('abort', Stage.leave());

    this.attachHookListeners();
  }

  private attachHookListeners = () => {
    this.scene.enter(this.onEnterScene);
    this.scene.action(/^.*$/, this.onSelectMood);
  };

  private onEnterScene = async (ctx: AppContext): Promise<void> => {
    this.dropState(ctx);

    const keyboard = getMoodKeyboard(ctx);
    await ctx.replyWithMarkdown(ctx.i18n.t('wannadrink.enter'), keyboard);
  };

  private onSelectMood = async (ctx: AppContext): Promise<void> => {
    await ctx.deleteMessage();

    const mood = ctx.i18n.t(`mood.${ctx.callbackQuery.data}`).toLowerCase();
    await ctx.replyWithMarkdown(ctx.i18n.t('wannadrink.moodSummary', { mood }));

    await helpers.sleep(1500);
    await ctx.replyWithMarkdown(ctx.i18n.t('wannadrink.suggestDrink'));
  };

  private dropState = (ctx: AppContext): void => {
    ctx.scene.state = {
      currentMood: '',
    } as WannaDrinkState;
  };
}
