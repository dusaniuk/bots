import { SHARED_TYPES } from '../../shared/ioc/shared.types';

export const TYPES = {
  ...SHARED_TYPES,

  MENTION_PARSER: Symbol.for('more.mentions-parser'),
  MENTION_SERVICE: Symbol.for('more.mention-service'),
  TELEGRAM_RESPONSE: Symbol.for('more.telegram-response'),
  CATCH_SERVICE: Symbol.for('more.catch.service'),

  CATCH_STORE: Symbol.for('more.catch.store'),
  USERS_STORE: Symbol.for('more.users.store'),

  MORE_BOT: Symbol.for('more.bot'),
};
