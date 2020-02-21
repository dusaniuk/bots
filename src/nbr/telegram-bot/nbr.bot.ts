import Telegraf, { Context, session, Stage } from 'telegraf';
import { User as TelegrafUser } from 'telegraf/typings/telegram-types';
import { inject, injectable } from 'inversify';
import I18n from 'telegraf-i18n';
import { resolve } from 'path';

import { CONFIG } from '../../config';
import { AppContext, Bot } from '../../shared/interfaces';

import { commandsInPrivateOnly, useFeedSchedule } from './middleware';
import { getChatsKeyboard } from './keyboards';
import { stringifyUsers } from './utils/user.utils';

import { TYPES } from '../types';
import { Scene } from './constants/enums';
import { TelegramScene } from './interfaces/telegramScene';
import { Logger } from '../../shared/logger';
import { TelegramUser } from '../core/interfaces/telegramUser';
import { UsersStore } from '../core/interfaces/store';

@injectable()
export class NbrBot implements Bot {
  private readonly bot: Telegraf<AppContext>;
  private readonly stage: Stage<AppContext>;

  constructor(
    @inject(TYPES.ANNOUNCE_SCENE) private announceScene: TelegramScene,
    @inject(TYPES.ACTIVITIES_SCENE) private activitiesScene: TelegramScene,
    @inject(TYPES.DELETE_ANNOUNCE_SCENE) private deleteAnnounceScene: TelegramScene,
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
  ) {
    this.bot = new Telegraf(CONFIG.nbr.botToken);
    this.stage = new Stage([]);
  }

  private useScenes = (): void => {
    this.activitiesScene.useScene(this.stage);
    this.announceScene.useScene(this.stage);
    this.deleteAnnounceScene.useScene(this.stage);
  };

  start = (): void => {
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

    this.useScenes();

    this.bot.command('start', async (ctx: AppContext) => {
      await ctx.replyWithMarkdown(ctx.i18n.t('start.intro'));
      await ctx.scene.enter(Scene.Activities);

      await this.saveTelegrafUser(ctx);
    });

    this.bot.command('announce', (ctx: AppContext) => {
      return ctx.scene.enter(Scene.Announce);
    });

    this.bot.command('deleteannounce', async (ctx: AppContext) => {
      await ctx.reply(ctx.i18n.t('deleteAnnounce.intro'));
      await ctx.scene.enter(Scene.DeleteAnnounce);
    });

    this.bot.command('chats', async (ctx: AppContext) => {
      const keyboard = getChatsKeyboard(ctx);

      await ctx.reply(ctx.i18n.t('chats.intro'), keyboard);
    });

    this.bot.on('new_chat_members', async (ctx: AppContext) => {
      let newMembers: TelegrafUser[] = ctx.message.new_chat_members || [];
      Logger.info(`[nbr] new users has been added to the chat ${ctx.chat.title} (ID: ${ctx.chat.id})`, newMembers);

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
      .then(() => Logger.info('[nbr] bot has been started'))
      .catch((err: Error) => {
        Logger.error('[nbr] bot has failed due to an error', err);
      });
  };

  private saveTelegrafUser = async ({ from }: Context): Promise<void> => {
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

    await this.usersStore.saveUser(user);
  };
}
