import { SHARED_TYPES } from '../../shared/ioc/shared.types';

export const DATABASE_TYPES = {
  ...SHARED_TYPES,

  CATCH_STORE: Symbol.for('more.catch.store'),
  USERS_STORE: Symbol.for('more.users.store'),
};
