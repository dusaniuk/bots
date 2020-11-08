import { inject, injectable } from 'inversify';
import { User as TelegrafUser } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../../shared/interfaces';
import { AlreadyInGameError } from '../../core/errors';
import { TYPES } from '../../types';

import { User } from '../../core/interfaces/user';
import { IUsersController } from '../../core/interfaces/controllers';

import { ContextParser } from '../services';
import { BaseActionHandler } from './base/base-action-handler';


@injectable()
export class NewMemberHandler extends BaseActionHandler {
  constructor(
    @inject(TYPES.CONTEXT_PARSER) private parser: ContextParser,
    @inject(TYPES.USERS_CONTROLLER) private usersController: IUsersController,
  ) {
    super();
  }

  protected handleAction = async (ctx: AppContext): Promise<void> => {
    const newHunters: User[] = this.getNewHunters(ctx);

    for (const hunter of newHunters) {
      await this.tryToAddHunterToTheGame(ctx.chat.id, hunter);
    }
  };

  private tryToAddHunterToTheGame = async (chatId: number, hunter: User): Promise<void> => {
    try {
      await this.usersController.addUserToGame(chatId, hunter);
    } catch (error) {
      if (error instanceof AlreadyInGameError) {
        await this.replyService.greetBackOldHunter();
      } else {
        throw error;
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
