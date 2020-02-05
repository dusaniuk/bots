import { ContainerModule, interfaces } from 'inversify';

import { SHARED_TYPES } from './shared.types';

import { Database } from '../interfaces';
import { createDatabase } from '../db';

export const sharedDependencies = new ContainerModule((bind: interfaces.Bind) => {
  bind<Database>(SHARED_TYPES.DATABASE).toConstantValue(createDatabase());
});
