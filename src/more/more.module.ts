import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from './types';

import { Bot } from '../shared/interfaces';

import { MoreBot } from './telegramBot/more.bot';
import { CatchHandler, UsersHandler, UtilsHandler } from './telegramBot/actionHandlers';
import { ContextParser, TelegramResponse } from './telegramBot/services';

import { ICatchController, IScoreController, IUsersController } from './core/interfaces/controllers';
import { CatchController, ScoreController, UsersController } from './core/controllers';
import { CatchService, MentionsService, ScoreService } from './core/service';
import { CatchStore, UsersStore } from './core/interfaces/store';

import { CatchFirestore } from './database/catch.firestore';
import { UsersFirestore } from './database/users.firestore';


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
  bind<ContextParser>(TYPES.CONTEXT_PARSER).to(ContextParser);
  bind<MentionsService>(TYPES.MENTION_SERVICE).to(MentionsService);
  bind<TelegramResponse>(TYPES.TELEGRAM_RESPONSE).to(TelegramResponse);
  bind<ScoreService>(TYPES.SCORE_SERVICE).to(ScoreService);

  // database
  bind<CatchStore>(TYPES.CATCH_STORE).to(CatchFirestore);
  bind<UsersStore>(TYPES.USERS_STORE).to(UsersFirestore);

  // the MR bot himself
  bind<Bot>(TYPES.MORE_BOT).to(MoreBot);
});
