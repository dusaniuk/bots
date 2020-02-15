import { Container } from 'inversify';

import { moreDependencies } from '../../more/ioc/more.module';
import { moreDatabaseModule } from '../../more/database';

import { nbrDependencies } from '../../nbr/ioc/nbr.module';

import { sharedDependencies } from './shared.module';


const container = new Container();

container.load(
  moreDependencies,
  moreDatabaseModule,

  nbrDependencies,
  sharedDependencies,
);

export { container };
