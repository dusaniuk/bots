import * as faker from 'faker';

import { User } from '../interfaces/user';
import { UsersStore } from '../interfaces/store';
import { AlreadyInGameError, NotInGameError } from '../errors';

import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  let usersStore: UsersStore;

  beforeEach(() => {
    usersStore = {
      isUserInChat: jest.fn(),
      addUserInChat: jest.fn(),
      updateUser: jest.fn(),
    } as any;

    controller = new UsersController(usersStore);
  });

  describe('addUserToGame', () => {
    let chatId: number;
    let user: User;

    beforeEach(() => {
      chatId = faker.random.number();
      user = { id: faker.random.number() } as User;
    });

    it('should call store to check if user is in chat', async () => {
      usersStore.isUserInChat = jest.fn().mockResolvedValue(false);

      await controller.addUserToGame(chatId, user);

      expect(usersStore.isUserInChat).toHaveBeenCalledWith(chatId, user.id);
    });

    it('should call store to add user into chat', async () => {
      usersStore.isUserInChat = jest.fn().mockResolvedValue(false);

      await controller.addUserToGame(chatId, user);

      expect(usersStore.addUserInChat).toHaveBeenCalledWith(chatId, user);
    });

    it('should throw AlreadyInGameError if user was already registered in a game', async () => {
      usersStore.isUserInChat = jest.fn().mockResolvedValue(true);

      const action: Promise<any> = controller.addUserToGame(chatId, user);

      const expectedMessage = `user ${user.id} is already in chat ${chatId}`;
      await expect(action).rejects.toEqual(new AlreadyInGameError(expectedMessage));
    });
  });

  describe('updateUserDataInChat', () => {
    let chatId: number;
    let userId: number;
    let props: Omit<User, 'id'>;

    beforeEach(() => {
      chatId = faker.random.number();
      userId = faker.random.number();
      props = {};
    });

    it('should call store to check if user is in chat', async () => {
      usersStore.isUserInChat = jest.fn().mockResolvedValue(true);

      await controller.updateUserDataInChat(chatId, userId, props);

      expect(usersStore.isUserInChat).toHaveBeenCalledWith(chatId, userId);
    });

    it('should call store to update user props', async () => {
      usersStore.isUserInChat = jest.fn().mockResolvedValue(true);

      await controller.updateUserDataInChat(chatId, userId, props);

      expect(usersStore.updateUser).toHaveBeenCalledWith(chatId, userId, { ...props });
    });

    it('should return NotInGameError if user is not registered in a game', async () => {
      usersStore.isUserInChat = jest.fn().mockResolvedValue(false);

      const action: Promise<any> = controller.updateUserDataInChat(chatId, userId, props);

      const expectedMessage = `can't find and update user ${userId} in chat ${chatId}`;
      await expect(action).rejects.toEqual(new NotInGameError(expectedMessage));
    });
  });
});
