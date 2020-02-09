import { ContainerModule, interfaces } from 'inversify';

import { Bot } from '../../shared/interfaces';

import { TYPES } from './types';
import { MoreBot } from '../more.bot';
import { CatchStore, UsersStore } from '../interfaces';
import { CatchFirestore, UsersFirestore } from '../stores';
import { CatchHandler, UsersHandler, UtilsHandler } from '../handlers';
import {
  MentionsParser,
  TelegramResponse,
  MentionsService,
  CatchService,
  ScoreService,
} from '../services';


export const moreDependencies = new ContainerModule((bind: interfaces.Bind) => {
  // bot action handlers
  bind<UtilsHandler>(UtilsHandler).toSelf();
  bind<UsersHandler>(UsersHandler).toSelf();
  bind<CatchHandler>(CatchHandler).toSelf();

  // DB interaction
  bind<CatchStore>(TYPES.CATCH_STORE).to(CatchFirestore);
  bind<UsersStore>(TYPES.USERS_STORE).to(UsersFirestore);

  // services
  bind<CatchService>(TYPES.CATCH_SERVICE).to(CatchService);
  bind<MentionsParser>(TYPES.MENTION_PARSER).to(MentionsParser);
  bind<MentionsService>(TYPES.MENTION_SERVICE).to(MentionsService);
  bind<TelegramResponse>(TYPES.TELEGRAM_RESPONSE).to(TelegramResponse);
  bind<ScoreService>(TYPES.SCORE_SERVICE).to(ScoreService);

  bind<Bot>(TYPES.MORE_BOT).to(MoreBot);
});
