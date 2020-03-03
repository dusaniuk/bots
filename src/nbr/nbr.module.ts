import { ContainerModule, interfaces } from 'inversify';

import { Bot, Database } from '../shared/interfaces';
import { TYPES } from './types';

import { ActivitiesStore, MessageStore, UsersStore } from './core/interfaces/store';

import { ActivitiesFirestore } from './database/activities.firestore';
import { UsersFirestore } from './database/users.firestore';
import { MessagingFirestore } from './database/messaging.firestore';
import { createDbConnection } from './database/firestore.connection';

import { NbrBot } from './telegram-bot/nbr.bot';
import { SceneFactory } from './telegram-bot/services/scene-factory';
import { AnnounceScene } from './telegram-bot/scenes/announce.scene';
import { TelegramScene } from './telegram-bot/interfaces/telegramScene';
import { ActivitiesScene } from './telegram-bot/scenes/activities.scene';
import { DeleteAnnounceScene } from './telegram-bot/scenes/deleteAnnounce.scene';
import { ISceneFactory } from './telegram-bot/interfaces/scene-factory';


export const nbrDependencies = new ContainerModule((bind: interfaces.Bind) => {
  // scenes
  bind<ISceneFactory>(TYPES.SCENE_FACTORY).to(SceneFactory);

  bind<TelegramScene>(TYPES.ACTIVITIES_SCENE).to(ActivitiesScene);
  bind<TelegramScene>(TYPES.ANNOUNCE_SCENE).to(AnnounceScene);
  bind<TelegramScene>(TYPES.DELETE_ANNOUNCE_SCENE).to(DeleteAnnounceScene);

  // DB interaction
  bind<Database>(TYPES.DATABASE).toConstantValue(createDbConnection());
  bind<ActivitiesStore>(TYPES.ACTIVITIES_STORE).to(ActivitiesFirestore);
  bind<MessageStore>(TYPES.MESSAGE_STORE).to(MessagingFirestore);
  bind<UsersStore>(TYPES.USERS_STORE).to(UsersFirestore);

  bind<Bot>(TYPES.NBR_BOT).to(NbrBot);
});
