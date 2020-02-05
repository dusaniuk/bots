import { ContainerModule, interfaces } from 'inversify';

import { Bot } from '../../shared/interfaces/bot';

import { TYPES } from './types';
import { NbrBot } from '../nbr.bot';

export const nbrDependencies = new ContainerModule((bind: interfaces.Bind) => {
  bind<Bot>(TYPES.NBR_BOT).to(NbrBot);
});
