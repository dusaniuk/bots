import { SHARED_TYPES } from '../../shared/ioc/shared.types';

export const TYPES = {
  ...SHARED_TYPES,

  MORE_BOT: Symbol.for('MoreBot'),

  CATCH_STORE: Symbol.for('catch.store'),
  USERS_STORE: Symbol.for('users.store'),
};
