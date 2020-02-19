import { inject, injectable } from 'inversify';

import { ActionResult } from '../models/actionResult';
import { TYPES } from '../../types';
import { AlreadyInGameError, NotInGameError } from '../errors';

import { IUsersController } from '../interfaces/controllers';
import { UsersStore } from '../interfaces/store';
import { User } from '../interfaces/user';

@injectable()
export class UsersController implements IUsersController {
  constructor(
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
  ) {}

  isUserInGame = async (chatId: number, userId: number): Promise<ActionResult> => {
    const isUserInChat: boolean = await this.usersStore.isUserInChat(chatId, userId);

    if (!isUserInChat) {
      const error: Error = new NotInGameError(`can't find and update user ${userId} in chat ${chatId}`);
      return new ActionResult(error);
    }

    return ActionResult.success();
  };

  addUserToGame = async (chatId: number, user: User): Promise<ActionResult> => {
    const isUserInChat: boolean = await this.usersStore.isUserInChat(chatId, user.id);

    if (isUserInChat) {
      const error: Error = new AlreadyInGameError(`user ${user.id} is already in chat ${chatId}`);
      return new ActionResult(error);
    }

    await this.usersStore.addUserInChat(chatId, user);
    return ActionResult.success();
  };

  updateUserDataInChat = async (chatId: number, userId: number, props: Omit<User, 'id'>): Promise<ActionResult> => {
    const result: ActionResult = await this.isUserInGame(chatId, userId);

    if (result.error) {
      return new ActionResult(result.error);
    }

    await this.usersStore.updateUser(chatId, userId, { ...props });
    return ActionResult.success();
  }
}
