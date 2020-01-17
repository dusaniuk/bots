/* eslint-disable no-console */
import Telegraf, { Context, session, Stage } from 'telegraf';
import { User as TelegrafUser } from 'telegraf/typings/telegram-types';
import { firestore } from 'firebase-admin';
import I18n from 'telegraf-i18n';
import { resolve } from 'path';

import { CONFIG } from '../config';
import { Bot } from '../shared/models/bot';

import { ActivitiesScene } from './scenes/activities.scene';
import { AnnounceScene } from './scenes/announce.scene';
import { TelegramUser, UsersService } from './services/users.service';
import { AppContext } from '../shared/models/appContext';
import { commandsInPrivateOnly } from './middleware/chat.middleware';
import { useFeedSchedule } from './middleware/timer.middleware';
import { getChatsKeyboard } from './keyboards/chats.keyboard';
import { DeleteAnnounceScene } from './scenes/deleteAnnounce.scene';
import { stringifyUsers } from './utils/user.utils';

export class NbrBot implements Bot {
  private readonly usersService: UsersService;

  private readonly bot: Telegraf<AppContext>;
  private readonly stage: Stage<AppContext>;

  constructor(private db: firestore.Firestore) {
    this.bot = new Telegraf(CONFIG.nbr.botToken);
    this.stage = new Stage([]);

    this.usersService = new UsersService(this.db);
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
    this.bot.use(useFeedSchedule());
    this.bot.use(commandsInPrivateOnly());

    this.useActivitiesScene();
    this.useAnnounceScene();
    this.useDeleteAnnounceScene();

    this.bot.command('start', async (ctx: AppContext) => {
      await ctx.replyWithMarkdown(ctx.i18n.t('start.intro'));
      await ctx.scene.enter(ActivitiesScene.ID);

      await this.saveTelegrafUser(ctx);
    });

    this.bot.command('announce', (ctx: AppContext) => {
      return ctx.scene.enter(AnnounceScene.ID);
    });

    this.bot.command('deleteannounce', async (ctx: AppContext) => {
      await ctx.reply(ctx.i18n.t('deleteAnnounce.intro'));
      await ctx.scene.enter(DeleteAnnounceScene.ID);
    });

    this.bot.command('chats', async (ctx: AppContext) => {
      const keyboard = getChatsKeyboard(ctx);

      await ctx.reply(ctx.i18n.t('chats.intro'), keyboard);
    });

    this.bot.on('new_chat_members', async (ctx: AppContext) => {
      let newMembers: TelegrafUser[] = ctx.message.new_chat_members || [];
      console.log(`${stringifyUsers(newMembers)} had been added to the chat ${ctx.chat.title} | ${ctx.chat.id}`);

      newMembers = newMembers.filter((member: TelegrafUser) => !member.is_bot);

      if (newMembers.length === 0) {
        return;
      }

      const chatMembersCount: number = await ctx.getChatMembersCount();
      const resourceKey: string = chatMembersCount % 10 === 0 ? 'start.greetAnniversary' : 'start.greet';

      await ctx.replyWithMarkdown(
        ctx.i18n.t(resourceKey, {
          users: stringifyUsers(newMembers),
          count: chatMembersCount,
        }),
      );

      await ctx.replyWithMarkdown(ctx.i18n.t('start.info'));
    });

    this.bot
      .launch()
      .then(() => console.log('nbr bot has been started'))
      .catch((err) => {
        console.error(err);
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

  private useDeleteAnnounceScene = () => {
    const { scene } = new DeleteAnnounceScene(this.db);
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
