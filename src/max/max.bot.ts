/* eslint-disable no-console */

import Telegraf, { session } from 'telegraf';
import I18n from 'telegraf-i18n';
import { resolve } from 'path';

import { Bot } from '../shared/models/bot';
import { AppContext } from '../shared/models/appContext';
import { CONFIG } from '../config';

export class MaxBot implements Bot {
  private readonly bot: Telegraf<AppContext>;

  constructor() {
    this.bot = new Telegraf(CONFIG.max.botToken);
  }

  start = () => {
    const i18n = new I18n({
      defaultLanguage: 'ua',
      allowMissing: false,
      directory: resolve(__dirname, 'locales'),
    });

    this.bot.use(session());
    this.bot.use(i18n.middleware());

    this.prayForMax();

    this.bot
      .launch()
      .then(() => console.log('max bot has been started'))
      .catch((err) => {
        console.error(err);
      });
  };

  private prayForMax = () => {
    this.bot.hears(/макс/i, (ctx: AppContext) => {
      return ctx.reply(ctx.i18n.t('other.maks'));
    });
  };
}
