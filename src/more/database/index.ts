import { ContainerModule, interfaces } from 'inversify';

import { CatchStore, UsersStore } from '../interfaces';

import { CatchFirestore } from './firestore/catch.firestore';
import { UsersFirestore } from './firestore/users.firestore';

import { DATABASE_TYPES } from './types';

export const moreDatabaseModule = new ContainerModule((bind: interfaces.Bind): void => {
  bind<CatchStore>(DATABASE_TYPES.CATCH_STORE).to(CatchFirestore);
  bind<UsersStore>(DATABASE_TYPES.USERS_STORE).to(UsersFirestore);
});
