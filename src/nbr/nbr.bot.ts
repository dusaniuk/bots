/* eslint-disable no-console */
import Telegraf, { SceneContextMessageUpdate, session, Stage } from 'telegraf';

import { CONFIG } from '../config';
import { Bot } from '../shared/bot';
import { GreeterScene } from './scenes/greeter.scene';

export class NbrBot implements Bot {
  private readonly bot: Telegraf<SceneContextMessageUpdate>;
  private readonly stage: Stage<SceneContextMessageUpdate>;

  private isRunning: boolean = false;

  constructor() {
    this.bot = new Telegraf(CONFIG.nbr.botToken);
    this.stage = new Stage([]);
  }

  start = () => {
    this.bot.use(session());
    this.bot.use(this.stage.middleware());

    this.useGreeterScene();

    this.bot.command('start', async (ctx: SceneContextMessageUpdate) => {
      await ctx.replyWithMarkdown(`Привіт, *${ctx.from.first_name}!*\nЯ буду сповіщати тебе про найближчі події в NBR клубі 🤓`);
      await ctx.scene.enter('greeter', {
        activities: [],
      });
    });

    this.bot
      .launch()
      .then(() => console.log('nbr bot has been started'))
      .catch((err) => {
        console.error(err);
        this.isRunning = false;
      });
  };

  private useGreeterScene = () => {
    const { scene } = new GreeterScene();
    this.stage.register(scene);
  };
}
