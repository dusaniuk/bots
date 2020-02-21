import { ContainerModule, interfaces } from 'inversify';

import { Bot } from '../shared/interfaces/bot';

import { TYPES } from './types';
import { NbrBot } from './telegram-bot/nbr.bot';
import { ActivitiesFirestore } from './database/activities.firestore';
import { UsersFirestore } from './database/users.firestore';
import { MessagingFirestore } from './database/messaging.firestore';
import { Scene } from './telegram-bot/constants/enums';
import { AnnounceScene } from './telegram-bot/scenes/announce.scene';
import { ActivitiesScene } from './telegram-bot/scenes/activities.scene';
import { DeleteAnnounceScene } from './telegram-bot/scenes/deleteAnnounce.scene';

import { ActivitiesStore, MessageStore, UsersStore } from './core/interfaces/store';

import { TelegramScene } from './telegram-bot/interfaces/telegramScene';

export const nbrDependencies = new ContainerModule((bind: interfaces.Bind) => {
  // scenes
  bind(TYPES.ACTIVITIES_ID).toConstantValue(Scene.Activities);
  bind<TelegramScene>(TYPES.ACTIVITIES_SCENE).to(ActivitiesScene);

  bind(TYPES.ANNOUNCE_ID).toConstantValue(Scene.Announce);
  bind<TelegramScene>(TYPES.ANNOUNCE_SCENE).to(AnnounceScene);

  bind(TYPES.DELETE_ANNOUNCE_ID).toConstantValue(Scene.DeleteAnnounce);
  bind<TelegramScene>(TYPES.DELETE_ANNOUNCE_SCENE).to(DeleteAnnounceScene);

  // DB interaction
  bind<ActivitiesStore>(TYPES.ACTIVITIES_STORE).to(ActivitiesFirestore);
  bind<MessageStore>(TYPES.MESSAGE_STORE).to(MessagingFirestore);
  bind<UsersStore>(TYPES.USERS_STORE).to(UsersFirestore);

  bind<Bot>(TYPES.NBR_BOT).to(NbrBot);
});
