import { Container } from 'inversify';

import { moreDependencies } from './bot/more.module';

const container = new Container();

container.load(moreDependencies);

export { container };
