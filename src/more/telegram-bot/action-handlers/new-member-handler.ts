import { inject, injectable } from 'inversify';
import { User as TelegrafUser } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';

import { User } from '../../core/interfaces/user';
import { ActionResult } from '../../core/models/action-result';
import { IUsersController } from '../../core/interfaces/controllers';

import { ContextParser, TelegramReplyService } from '../services';
import { ActionHandler } from '../interfaces/action-handler';


@injectable()
export class NewMemberHandler implements ActionHandler {
  private telegrafReply: TelegramReplyService;

  constructor(
    @inject(TYPES.CONTEXT_PARSER) private parser: ContextParser,
    @inject(TYPES.USERS_CONTROLLER) private usersController: IUsersController,
  ) {}


  handleAction = async (ctx: AppContext): Promise<void> => {
    this.telegrafReply = new TelegramReplyService(ctx);

    const newHunters: User[] = this.getNewHunters(ctx);

    for (const hunter of newHunters) {
      const result: ActionResult = await this.usersController.isUserInGame(ctx.chat.id, hunter.id);

      if (result.ok) {
        await this.telegrafReply.greetBackOldHunter();
      } else {
        await this.usersController.addUserToGame(ctx.chat.id, hunter);
      }
    }
  };

  private getNewHunters = (ctx: AppContext): User[] => {
    const newChatMembers: TelegrafUser[] = ctx.message?.new_chat_members ?? [];
    const newChatUsers: TelegrafUser[] = newChatMembers.filter((user) => !user.is_bot);

    return newChatUsers.map((user: TelegrafUser) => {
      return this.parser.mapToUserEntity(user);
    });
  };
}
