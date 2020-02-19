import { SHARED_TYPES } from '../shared/ioc/shared.types';

export const TYPES = {
  ...SHARED_TYPES,

  MENTION_PARSER: Symbol.for('more.mentions-parser'),
  MENTION_SERVICE: Symbol.for('more.mention.service'),
  TELEGRAM_RESPONSE: Symbol.for('more.telegram-response'),
  CATCH_SERVICE: Symbol.for('more.catch.service'),
  SCORE_SERVICE: Symbol.for('more.score.service'),

  USERS_CONTROLLER: Symbol.for('more.users.controller'),
  SCORE_CONTROLLER: Symbol.for('more.score.controller'),
  CATCH_CONTROLLER: Symbol.for('more.catch.controller'),

  CATCH_STORE: Symbol.for('more.catch.store'),
  USERS_STORE: Symbol.for('more.users.store'),

  MORE_BOT: Symbol.for('more.bot'),
};
