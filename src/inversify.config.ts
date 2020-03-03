import { Container } from 'inversify';

import { moreDependencies } from './more/more.module';
import { nbrDependencies } from './nbr/nbr.module';


const container = new Container();

container.load(
  moreDependencies,
  nbrDependencies,
);

export { container };
