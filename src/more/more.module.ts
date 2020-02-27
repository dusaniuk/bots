import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from './types';

import { Bot } from '../shared/interfaces';

import { MoreBot } from './telegram-bot/more.bot';
import {
  ApproveCatchHandler,
  CatchHandler,
  HelpHandler,
  LeftMemberHandler,
  NewMemberHandler,
  PingHandler,
  RegisterHandler,
  RejectCatchHandler,
  ScoreHandler,
  UpdateHandler,
} from './telegram-bot/action-handlers';
import { ContextParser } from './telegram-bot/services';
import { ActionHandler } from './telegram-bot/interfaces/action-handler';

import { ICatchController, IScoreController, IUsersController } from './core/interfaces/controllers';
import { CatchController, ScoreController, UsersController } from './core/controllers';
import { CatchService, MentionsService, ScoreService } from './core/service';
import { CatchStore, UsersStore } from './core/interfaces/store';

import { CatchFirestore } from './database/catch.firestore';
import { UsersFirestore } from './database/users.firestore';


export const moreDependencies = new ContainerModule((bind: interfaces.Bind) => {
  // action handlers
  bind<ActionHandler>(TYPES.REGISTER_HANDLER).to(RegisterHandler);
  bind<ActionHandler>(TYPES.UPDATE_HANDLER).to(UpdateHandler);
  bind<ActionHandler>(TYPES.SCORE_HANDLER).to(ScoreHandler);
  bind<ActionHandler>(TYPES.NEW_MEMBER_HANDLER).to(NewMemberHandler);
  bind<ActionHandler>(TYPES.LEFT_MEMBER_HANDLER).to(LeftMemberHandler);
  bind<ActionHandler>(TYPES.HELP_HANDLER).to(HelpHandler);
  bind<ActionHandler>(TYPES.PING_HANDLER).to(PingHandler);
  bind<ActionHandler>(TYPES.CATCH_HANDLER).to(CatchHandler);
  bind<ActionHandler>(TYPES.APPROVE_CATCH_HANDLER).to(ApproveCatchHandler);
  bind<ActionHandler>(TYPES.REJECT_CATCH_HANDLER).to(RejectCatchHandler);

  // controllers
  bind<IUsersController>(TYPES.USERS_CONTROLLER).to(UsersController);
  bind<IScoreController>(TYPES.SCORE_CONTROLLER).to(ScoreController);
  bind<ICatchController>(TYPES.CATCH_CONTROLLER).to(CatchController);

  // services
  bind<CatchService>(TYPES.CATCH_SERVICE).to(CatchService);
  bind<ContextParser>(TYPES.CONTEXT_PARSER).to(ContextParser);
  bind<MentionsService>(TYPES.MENTION_SERVICE).to(MentionsService);
  bind<ScoreService>(TYPES.SCORE_SERVICE).to(ScoreService);

  // database
  bind<CatchStore>(TYPES.CATCH_STORE).to(CatchFirestore);
  bind<UsersStore>(TYPES.USERS_STORE).to(UsersFirestore);

  // the MR bot himself
  bind<Bot>(TYPES.MORE_BOT).to(MoreBot);
});
