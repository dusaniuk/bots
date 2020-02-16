import { ContainerModule, interfaces } from 'inversify';

import { Bot } from '../../shared/interfaces';

import { TYPES } from './types';
import { MoreBot } from '../more.bot';
import { CatchHandler, UsersHandler, UtilsHandler } from '../actionHandlers';
import {
  MentionsParser,
  TelegramResponse,
  MentionsService,
  CatchService,
  ScoreService,
} from '../services';
import { UsersController } from '../core/controllers/users.controller';
import { ScorePresenter, UsersPresenter } from '../core/interfaces/controllers';
import { ScoreController } from '../core/controllers/score.controller';


export const moreDependencies = new ContainerModule((bind: interfaces.Bind) => {
  // bot action handlers
  bind<UtilsHandler>(UtilsHandler).toSelf();
  bind<UsersHandler>(UsersHandler).toSelf();
  bind<CatchHandler>(CatchHandler).toSelf();

  // controllers
  bind<UsersPresenter>(TYPES.USERS_HANDLER).to(UsersController);
  bind<ScorePresenter>(TYPES.SCORE_HANDLER).to(ScoreController);

  // services
  bind<CatchService>(TYPES.CATCH_SERVICE).to(CatchService);
  bind<MentionsParser>(TYPES.MENTION_PARSER).to(MentionsParser);
  bind<MentionsService>(TYPES.MENTION_SERVICE).to(MentionsService);
  bind<TelegramResponse>(TYPES.TELEGRAM_RESPONSE).to(TelegramResponse);
  bind<ScoreService>(TYPES.SCORE_SERVICE).to(ScoreService);

  bind<Bot>(TYPES.MORE_BOT).to(MoreBot);
});
