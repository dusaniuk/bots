import { ContainerModule, interfaces } from 'inversify';

import { Bot } from '../../shared/interfaces';

import { TYPES } from './types';
import { MoreBot } from '../telegramBot/more.bot';
import { CatchHandler, UsersHandler, UtilsHandler } from '../telegramBot/actionHandlers';
import { MentionsParser, TelegramResponse } from '../telegramBot/services';

import { ICatchController, IScoreController, IUsersController } from '../core/interfaces/controllers';
import { UsersController } from '../core/controllers/users.controller';
import { ScoreController } from '../core/controllers/score.controller';
import { CatchController } from '../core/controllers/catch.controller';
import { CatchService, MentionsService, ScoreService } from '../core/service';


export const moreDependencies = new ContainerModule((bind: interfaces.Bind) => {
  // bot action handlers
  bind<UtilsHandler>(UtilsHandler).toSelf();
  bind<UsersHandler>(UsersHandler).toSelf();
  bind<CatchHandler>(CatchHandler).toSelf();

  // controllers
  bind<IUsersController>(TYPES.USERS_CONTROLLER).to(UsersController);
  bind<IScoreController>(TYPES.SCORE_CONTROLLER).to(ScoreController);
  bind<ICatchController>(TYPES.CATCH_CONTROLLER).to(CatchController);

  // services
  bind<CatchService>(TYPES.CATCH_SERVICE).to(CatchService);
  bind<MentionsParser>(TYPES.MENTION_PARSER).to(MentionsParser);
  bind<MentionsService>(TYPES.MENTION_SERVICE).to(MentionsService);
  bind<TelegramResponse>(TYPES.TELEGRAM_RESPONSE).to(TelegramResponse);
  bind<ScoreService>(TYPES.SCORE_SERVICE).to(ScoreService);

  bind<Bot>(TYPES.MORE_BOT).to(MoreBot);
});
