import { ContainerModule, interfaces } from 'inversify';

import { Bot } from '../../shared/interfaces/bot';

import { TYPES } from './types';
import { NbrBot } from '../nbr.bot';
import { ActivitiesStore } from '../interfaces/activities.store';
import { ActivitiesFirestore } from '../store/activities.firestore';
import { MessageStore } from '../interfaces/message.store';
import { UsersStore } from '../interfaces/users.store';
import { UsersFirestore } from '../store/users.firestore';
import { MessagingFirestore } from '../store/messaging.firestore';
import { Scene } from '../constants/enums';
import { AnnounceScene } from '../scenes/announce.scene';
import { ActivitiesScene } from '../scenes/activities.scene';
import { DeleteAnnounceScene } from '../scenes/deleteAnnounce.scene';

import { TelegramScene } from '../interfaces/telegramScene';

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
