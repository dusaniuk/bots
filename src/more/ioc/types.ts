import { SHARED_TYPES } from '../../shared/ioc/shared.types';

export const TYPES = {
  ...SHARED_TYPES,

  CATCH_STORE: Symbol.for('more.catch.store'),
  USERS_STORE: Symbol.for('more.users.store'),

  MORE_BOT: Symbol.for('more.bot'),
};
