/* eslint-disable no-console */

import Telegraf, { session, Stage } from 'telegraf';
import I18n from 'telegraf-i18n';
import { resolve } from 'path';

import { Bot } from '../shared/models/bot';
import { AppContext } from '../shared/models/appContext';
import { CONFIG } from '../config';
import { WannaDrinkScene } from './scenes/wannadrink.scene';
import { ActivitiesScene } from '../nbr/scenes/activities.scene';

export class MaxBot implements Bot {
  private readonly bot: Telegraf<AppContext>;
  private readonly stage: Stage<AppContext>;

  constructor() {
    this.bot = new Telegraf(CONFIG.max.botToken);
    this.stage = new Stage([]);
  }

  start = () => {
    const i18n = new I18n({
      defaultLanguage: 'ua',
      allowMissing: false,
      directory: resolve(__dirname, 'locales'),
    });

    this.bot.use(session());
    this.bot.use(i18n.middleware());
    this.bot.use(this.stage.middleware());

    this.prayForMax();
    this.useWannaDrinkScene();

    this.bot.command('wannadrink', ctx => ctx.scene.enter(WannaDrinkScene.ID));

    this.bot
      .launch()
      .then(() => console.log('max bot has been started'))
      .catch((err) => {
        console.error(err);
      });
  };

  private useWannaDrinkScene = () => {
    const { scene } = new WannaDrinkScene();
    this.stage.register(scene);
  };

  private prayForMax = () => {
    this.bot.hears(/макс/i, (ctx: AppContext) => {
      return ctx.reply(ctx.i18n.t('other.maks'));
    });
  };
}
