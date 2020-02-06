import { SHARED_TYPES } from '../../shared/ioc/shared.types';

export const TYPES = {
  ...SHARED_TYPES,

  ACTIVITIES_ID: Symbol.for('nbr.activities-scene.id'),
  ANNOUNCE_ID: Symbol.for('nbr.announce-scene.id'),
  DELETE_ANNOUNCE_ID: Symbol.for('nbr.delete-announce-scene.id'),

  ACTIVITIES_SCENE: Symbol.for('nbr.activities.scene'),
  ANNOUNCE_SCENE: Symbol.for('nbr.announce.scene'),
  DELETE_ANNOUNCE_SCENE: Symbol.for('nbr.delete-announce.scene'),

  ACTIVITIES_STORE: Symbol.for('nbr.activities.store'),
  MESSAGE_STORE: Symbol.for('nbr.message.store'),
  USERS_STORE: Symbol.for('nbr.users.store'),

  NBR_BOT: Symbol.for('nbr.bot'),
};
