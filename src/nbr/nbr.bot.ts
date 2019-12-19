/* eslint-disable no-console */
import Telegraf, { SceneContextMessageUpdate, session, Stage } from 'telegraf';
import { firestore } from 'firebase-admin';

import { CONFIG } from '../config';
import { Bot } from '../shared/bot';
import { ActivitiesScene } from './scenes/activities.scene';

export class NbrBot implements Bot {
  private readonly bot: Telegraf<SceneContextMessageUpdate>;
  private readonly stage: Stage<SceneContextMessageUpdate>;

  private isRunning: boolean = false;

  constructor(private db: firestore.Firestore) {
    this.bot = new Telegraf(CONFIG.nbr.botToken);
    this.stage = new Stage([]);
  }

  start = () => {
    this.bot.use(session());
    this.bot.use(this.stage.middleware());

    this.useActivitiesScene();

    this.bot.command('start', async (ctx: SceneContextMessageUpdate) => {
      await ctx.replyWithMarkdown(`Привіт, *${ctx.from.first_name}!*\nЯ буду сповіщати тебе про найближчі події в NBR клубі 🤓`);
      await ctx.scene.enter(ActivitiesScene.ID, {
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

  private useActivitiesScene = () => {
    const { scene } = new ActivitiesScene(this.db);
    this.stage.register(scene);
  };
}
