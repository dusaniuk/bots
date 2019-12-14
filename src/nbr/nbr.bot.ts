/* eslint-disable no-console */
import Telegraf, { ContextMessageUpdate } from 'telegraf';

import { CONFIG } from '../config';
import { Bot } from '../shared/bot';

export class NbrBot implements Bot {
  private readonly bot: Telegraf<ContextMessageUpdate>;

  private isRunning: boolean = false;

  constructor() {
    this.bot = new Telegraf(CONFIG.nbr.botToken);
  }

  start = () => {
    this.bindPublicCommands();

    this.bot
      .launch()
      .then(() => console.log('nbr bot has been started'))
      .catch((err) => {
        console.error(err);
        this.isRunning = false;
      });
  };

  stop = () => {};

  private bindPublicCommands = () => {
    this.bot.command('ping', (ctx: ContextMessageUpdate) => {
      return ctx.reply('pong');
    });
  };
}
