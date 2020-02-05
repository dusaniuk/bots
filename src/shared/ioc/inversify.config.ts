import { Container } from 'inversify';

import { moreDependencies } from '../../more/ioc/more.module';
import { nbrDependencies } from '../../nbr/ioc/nbr.module';
import { sharedDependencies } from './shared.module';


const container = new Container();

container.load(
  sharedDependencies,
  moreDependencies,
  nbrDependencies,
);

export { container };
