import { inject, injectable } from 'inversify';

import { TYPES } from '../../types';

import { User } from '../interfaces/user';
import { UsersStore } from '../interfaces/store';
import { IUsersController } from '../interfaces/controllers';
import { AlreadyInGameError, NotInGameError } from '../errors';


@injectable()
export class UsersController implements IUsersController {
  constructor(
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
  ) {}

  addUserToGame = async (chatId: number, user: User): Promise<void> => {
    const isUserInChat: boolean = await this.usersStore.isUserInChat(chatId, user.id);

    if (isUserInChat) {
      throw new AlreadyInGameError(`user ${user.id} is already in chat ${chatId}`);
    }

    await this.usersStore.addUserInChat(chatId, user);
  };

  updateUserDataInChat = async (chatId: number, userId: number, props: Omit<User, 'id'>): Promise<void> => {
    const isUserInChat: boolean = await this.usersStore.isUserInChat(chatId, userId);

    if (!isUserInChat) {
      throw new NotInGameError(`can't find and update user ${userId} in chat ${chatId}`);
    }

    await this.usersStore.updateUser(chatId, userId, { ...props });
  }
}
