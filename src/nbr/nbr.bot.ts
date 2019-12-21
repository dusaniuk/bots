/* eslint-disable no-console */
import Telegraf, {
  Context, SceneContextMessageUpdate, session, Stage,
} from 'telegraf';
import I18n from 'telegraf-i18n';
import { firestore } from 'firebase-admin';
import * as path from 'path';

import { CONFIG } from '../config';
import { Bot } from '../shared/bot';

import { ActivitiesScene } from './scenes/activities.scene';
import { AnnounceScene } from './scenes/announce.scene';
import { TelegramUser, UsersService } from './services/users.service';
import { AppContext } from './models/appContext';
import { onlyPrivate } from './middleware/chat.middleware';

export class NbrBot implements Bot {
  private readonly usersService: UsersService;

  private readonly bot: Telegraf<SceneContextMessageUpdate>;
  private readonly stage: Stage<SceneContextMessageUpdate>;

  private isRunning: boolean = false;

  constructor(private db: firestore.Firestore) {
    this.bot = new Telegraf(CONFIG.nbr.botToken);
    this.stage = new Stage([]);

    this.usersService = new UsersService(this.db);
  }

  start = () => {
    const i18n = new I18n({
      defaultLanguage: 'ua',
      allowMissing: false,
      directory: path.resolve(__dirname, 'locales'),
    });

    this.bot.use(session());
    this.bot.use(i18n.middleware());
    this.bot.use(this.stage.middleware());
    this.bot.use(onlyPrivate());

    this.useActivitiesScene();
    this.useAnnounceScene();

    this.bot.command('start', async (ctx: AppContext) => {
      await ctx.replyWithMarkdown(ctx.i18n.t('start.greeting'));
      await ctx.scene.enter(ActivitiesScene.ID);

      await this.saveTelegrafUser(ctx);
    });

    this.bot.command('announce', async (ctx: SceneContextMessageUpdate) => {
      await ctx.scene.enter(AnnounceScene.ID);
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

  private useAnnounceScene = () => {
    const { scene } = new AnnounceScene(this.db);
    this.stage.register(scene);
  };

  private saveTelegrafUser = async ({ from }: Context) => {
    const user: TelegramUser = {
      id: from.id.toString(),
      firstName: from.first_name,
    };

    if (from.last_name) {
      user.lastName = from.last_name;
    }

    if (from.username) {
      user.username = from.username;
    }

    await this.usersService.saveUser(user);
  };
}
