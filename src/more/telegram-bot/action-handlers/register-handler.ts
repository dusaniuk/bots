import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { Logger } from '../../../shared/logger';
import { TYPES } from '../../types';

import { User } from '../../core/interfaces/user';
import { AlreadyInGameError } from '../../core/errors';
import { ActionResult } from '../../core/models/action-result';
import { IUsersController } from '../../core/interfaces/controllers';

import { ContextParser, TelegramReplyService } from '../services';
import { ChatType } from '../constants/chat-type';
import { ActionHandler } from '../interfaces/action-handler';


@injectable()
export class RegisterHandler implements ActionHandler {
  private replyService: TelegramReplyService;

  constructor(
    @inject(TYPES.CONTEXT_PARSER) private parser: ContextParser,
    @inject(TYPES.USERS_CONTROLLER) private usersController: IUsersController,
  ) {}

  handleAction = async (ctx: AppContext): Promise<any> => {
    Logger.info(`[more] chat: ${ctx.chat.id} | register action is called by ${ctx.from.first_name} (${ctx.from.id})`);

    this.replyService = new TelegramReplyService(ctx);

    if (this.isChatPrivate(ctx)) {
      Logger.warn(`[more] user ${ctx.from.first_name} (${ctx.from.id}) tries to register in private chat`);
      return this.replyService.rejectRegistrationInPrivateChat();
    }

    const hunter: User = this.parser.mapToUserEntity(ctx.from);
    const result: ActionResult = await this.usersController.addUserToGame(ctx.chat.id, hunter);

    if (result.failed) {
      return this.handleAddHunterToGameError(result.error);
    }

    Logger.info(`[more] user ${ctx.from.first_name} (${ctx.from.id}) has been added to the game in chat ${ctx.chat.title} (${ctx.chat.id})`);
    return this.replyService.greetNewHunter(hunter);
  };


  private isChatPrivate = (ctx: AppContext): boolean => {
    return ctx.chat?.type === ChatType.private;
  };

  private handleAddHunterToGameError = (error: Error): Promise<void> => {
    Logger.error('[more] register action error: ', error);

    if (error instanceof AlreadyInGameError) {
      return this.replyService.showAlreadyInGameError();
    }

    return this.replyService.showUnexpectedError();
  };
}
