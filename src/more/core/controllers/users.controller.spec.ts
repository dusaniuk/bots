import * as faker from 'faker';

import { UsersController } from './users.controller';
import { User, UsersStore } from '../../interfaces';
import { ActionResult } from '../models/actionResult';
import { AlreadyInGameError, NotInGameError } from '../errors';

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

  describe('isUserInGame', () => {
    let chatId: number;
    let userId: number;

    beforeEach(() => {
      chatId = faker.random.number();
      userId = faker.random.number();
    });

    it('should call store to check if user is in chat', async () => {
      await controller.isUserInGame(chatId, userId);

      expect(usersStore.isUserInChat).toHaveBeenCalledWith(chatId, userId);
    });

    it('should return success response', async () => {
      usersStore.isUserInChat = jest.fn().mockResolvedValue(true);

      const result: ActionResult = await controller.isUserInGame(chatId, userId);

      expect(result.ok).toBeTruthy();
    });

    it('should return NotInGameError if user is not registered in a game', async () => {
      usersStore.isUserInChat = jest.fn().mockResolvedValue(false);

      const result: ActionResult = await controller.isUserInGame(chatId, userId);

      expect(result.ok).toBeFalsy();
      expect(result.error instanceof NotInGameError).toBeTruthy();
    });
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

    it('should return success response if user is new for a chat', async () => {
      usersStore.isUserInChat = jest.fn().mockResolvedValue(false);

      const result: ActionResult = await controller.addUserToGame(chatId, user);

      expect(result.ok).toBeTruthy();
    });

    it('should return AlreadyInGameError if user was already registered in a game', async () => {
      usersStore.isUserInChat = jest.fn().mockResolvedValue(true);

      const result: ActionResult = await controller.addUserToGame(chatId, user);

      expect(result.ok).toBeFalsy();
      expect(result.error instanceof AlreadyInGameError).toBeTruthy();
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

    it('should return success response if user was updated successfully', async () => {
      usersStore.isUserInChat = jest.fn().mockResolvedValue(true);

      const result: ActionResult = await controller.updateUserDataInChat(chatId, userId, props);

      expect(result.ok).toBeTruthy();
    });

    it('should return NotInGameError if user is not registered in a game', async () => {
      usersStore.isUserInChat = jest.fn().mockResolvedValue(false);

      const result: ActionResult = await controller.updateUserDataInChat(chatId, userId, props);

      expect(result.ok).toBeFalsy();
      expect(result.error instanceof NotInGameError).toBeTruthy();
    });
  });
});
