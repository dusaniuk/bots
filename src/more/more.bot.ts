/* eslint-disable no-console */
import Telegraf, { ContextMessageUpdate } from 'telegraf';

import { CONFIG } from '../config';

import { Database } from './interfaces/database';
import { TelegrafResponseService } from './services/telegraf-response.service';

import { ActionsHandler } from './bot/actions-handler';
import { FirestoreDatabase } from './database';
import { Bot } from '../shared/bot';

export class MoreBot implements Bot {
  private readonly telegrafBot: Telegraf<ContextMessageUpdate>;
  private readonly handler: ActionsHandler;
  private readonly usersDb: Database;

  private isRunning: boolean = false;

  constructor() {
    this.telegrafBot = new Telegraf(CONFIG.more.botToken);
    this.usersDb = new FirestoreDatabase();

    const responseService: TelegrafResponseService = new TelegrafResponseService();
    this.handler = new ActionsHandler(this.usersDb, responseService);
  }

  start = () => {
    this.bindPublicCommands();
    this.bindPrivateCommands();
    this.bindCallbackQueries();
    this.bindHears();

    this.telegrafBot
      .launch()
      .then(() => console.log('bot has been started'))
      .catch((err) => {
        console.error(err);
        this.isRunning = false;
      });

    this.isRunning = true;
  };

  stop = () => {
    if (this.isRunning) {
      this.telegrafBot.stop();
    }
  };

  private bindPublicCommands = () => {
    this.telegrafBot.command('ping', this.handler.pong);
    this.telegrafBot.command('reg', this.handler.register);
    this.telegrafBot.command('score', this.handler.getScore);

    this.telegrafBot.command('help', this.handler.getHelp);
    this.telegrafBot.command('halp', this.handler.getHelp);

    this.telegrafBot.command('capture', this.handler.capture);
    this.telegrafBot.command('c', this.handler.capture);
  };

  private bindPrivateCommands = () => {
    this.telegrafBot.command('announce', this.handler.announce);
  };

  private bindCallbackQueries = () => {
    this.telegrafBot.on('callback_query', this.handler.handleAdminAnswer);
  };

  private bindHears = () => {
    this.telegrafBot.hears(/макс/i, this.handler.aveMaks);
  };
}
