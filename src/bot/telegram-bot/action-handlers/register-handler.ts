import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { Logger } from '../../../shared/logger';
import { TYPES } from '../../types';

import { User } from '../../core/interfaces/user';
import { IUsersController } from '../../core/interfaces/controllers';

import { ContextParser } from '../services';
import { ChatType } from '../constants/chat-type';
import { BaseActionHandler } from './base/base-action-handler';


@injectable()
export class RegisterHandler extends BaseActionHandler {
  constructor(
    @inject(TYPES.CONTEXT_PARSER) private parser: ContextParser,
    @inject(TYPES.USERS_CONTROLLER) private usersController: IUsersController,
  ) {
    super();
  }

  protected handleAction = async (ctx: AppContext): Promise<any> => {
    if (this.isChatPrivate(ctx)) {
      Logger.warn(`[more] user ${ctx.from.first_name} (${ctx.from.id}) tries to register in private chat`);
      return this.replyService.rejectRegistrationInPrivateChat();
    }

    const hunter: User = this.parser.mapToUserEntity(ctx.from);
    await this.usersController.addUserToGame(ctx.chat.id, hunter);

    Logger.info(`[more] user ${ctx.from.first_name} (${ctx.from.id}) has been added to the game in chat ${ctx.chat.title} (${ctx.chat.id})`);
    return this.replyService.greetNewHunter(hunter);
  };


  private isChatPrivate = (ctx: AppContext): boolean => {
    return ctx.chat?.type === ChatType.private;
  };
}
