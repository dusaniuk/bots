import * as faker from 'faker';

import { CatchService } from './catch.service';
import { CatchStore, UsersStore } from '../core/interfaces/store';
import { CatchResult, User } from '../interfaces';

describe('CatchService', () => {
  let service: CatchService;

  let catchStore: CatchStore;
  let usersStore: UsersStore;

  beforeEach(() => {
    jest.clearAllMocks();

    catchStore = {
      addCatchRecord: jest.fn(),
      approveCatch: jest.fn(),
      getCatchRecord: jest.fn().mockResolvedValue({}),
    } as any;

    usersStore = {
      getUserFromChat: jest.fn(),
    } as any;

    service = new CatchService(catchStore, usersStore);
  });

  describe('addCatchRecord', () => {
    it('should add catch record to the store', () => {
      const chatId: number = faker.random.number();
      const hunterId: number = faker.random.number();
      const victims: User[] = [{ id: faker.random.number() }];

      service.addCatchRecord(chatId, hunterId, victims);

      expect(catchStore.addCatchRecord).toHaveBeenCalledWith(chatId, {
        hunterId,
        approved: false,
        timestamp: expect.any(Number),
        victims: [victims[0].id],
        points: 4,
      });
    });
  });

  describe('approveCatch', () => {
    let chatId: number;
    let catchId: string;

    beforeEach(() => {
      chatId = faker.random.number();
      catchId = faker.random.uuid();
    });

    it('should approve catch in store', async () => {
      await service.approveCatch(chatId, catchId);

      expect(catchStore.approveCatch).toHaveBeenCalledWith(chatId, catchId);
    });

    it('should get catch record from store', async () => {
      await service.approveCatch(chatId, catchId);

      expect(catchStore.getCatchRecord).toHaveBeenCalledWith(chatId, catchId);
    });

    it('should get user from store', async () => {
      const hunterId: number = faker.random.number();
      catchStore.getCatchRecord = jest.fn().mockResolvedValue({ hunterId });

      await service.approveCatch(chatId, catchId);

      expect(usersStore.getUserFromChat).toHaveBeenCalledWith(hunterId, chatId);
    });

    it('should return catch result', async () => {
      const earnedPoints: number = faker.random.number(100);
      const hunter: User = {} as User;

      catchStore.getCatchRecord = jest.fn().mockResolvedValue({ points: earnedPoints });
      usersStore.getUserFromChat = jest.fn().mockResolvedValue(hunter);

      const result: CatchResult = await service.approveCatch(chatId, catchId);

      expect(result).toEqual({
        hunter,
        earnedPoints,
      });
    });
  });

  describe('rejectCatch', () => {
    let chatId: number;
    let catchId: string;

    beforeEach(() => {
      chatId = faker.random.number();
      catchId = faker.random.uuid();
    });

    it('should get catch record from store', async () => {
      await service.rejectCatch(chatId, catchId);

      expect(catchStore.getCatchRecord).toHaveBeenCalledWith(chatId, catchId);
    });

    it('should get user from store', async () => {
      const hunterId: number = faker.random.number();
      catchStore.getCatchRecord = jest.fn().mockResolvedValue({ hunterId });

      await service.rejectCatch(chatId, catchId);

      expect(usersStore.getUserFromChat).toHaveBeenCalledWith(hunterId, chatId);
    });

    it('should return catch result', async () => {
      const earnedPoints: number = faker.random.number(100);
      const hunter: User = {} as User;

      catchStore.getCatchRecord = jest.fn().mockResolvedValue({ points: earnedPoints });
      usersStore.getUserFromChat = jest.fn().mockResolvedValue(hunter);

      const result: CatchResult = await service.rejectCatch(chatId, catchId);

      expect(result).toEqual({
        hunter,
        earnedPoints,
      });
    });
  });
});
