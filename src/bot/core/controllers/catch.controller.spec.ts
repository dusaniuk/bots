import * as faker from 'faker';

import { User } from '../interfaces/user';
import { UsersStore } from '../interfaces/store';
import { CatchMentions } from '../models/catch-mentions';
import { CatchService, MentionsService } from '../service';
import { CatchResult, CatchSummary, Mention } from '../interfaces/catch';
import { CatchHimselfError, NoCatchError, UnverifiedMentionsError } from '../errors';

import { CatchController } from './catch.controller';

describe('CatchController', () => {
  let controller: CatchController;

  let usersStore: UsersStore;
  let catchService: CatchService;
  let mentionService: MentionsService;

  beforeEach(() => {
    usersStore = {
      getAdminFromChat: jest.fn().mockResolvedValue({} as User),
    } as any;

    catchService = {
      addCatchRecord: jest.fn().mockResolvedValue(''),
      approveCatch: jest.fn().mockResolvedValue({}),
      rejectCatch: jest.fn().mockResolvedValue({}),
    } as any;

    mentionService = {
      getMentionedUsersData: jest.fn().mockResolvedValue(new CatchMentions([{} as User])),
    } as any;

    controller = new CatchController(usersStore, catchService, mentionService);
  });

  describe('approveCatch', () => {
    let chatId: number;
    let catchId: string;

    beforeEach(() => {
      chatId = faker.random.number();
      catchId = faker.random.uuid();
    });

    it('should call service to approve catch', async () => {
      await controller.approveCatch(chatId, catchId);

      expect(catchService.approveCatch).toHaveBeenCalledWith(chatId, catchId);
    });

    it('should return success response', async () => {
      const catchResultMock: CatchResult = {} as CatchResult;
      catchService.approveCatch = jest.fn().mockResolvedValue(catchResultMock);

      const result: CatchResult = await controller.approveCatch(chatId, catchId);

      expect(result).toEqual(catchResultMock);
    });
  });

  describe('rejectCatch', () => {
    let chatId: number;
    let catchId: string;

    beforeEach(() => {
      chatId = faker.random.number();
      catchId = faker.random.uuid();
    });

    it('should call service to reject catch', async () => {
      await controller.rejectCatch(chatId, catchId);

      expect(catchService.rejectCatch).toHaveBeenCalledWith(chatId, catchId);
    });

    it('should return success response', async () => {
      const catchResultMock: CatchResult = {} as CatchResult;
      catchService.rejectCatch = jest.fn().mockResolvedValue(catchResultMock);

      const result: CatchResult = await controller.rejectCatch(chatId, catchId);

      expect(result).toEqual(catchResultMock);
    });
  });

  describe('registerVictimsCatch', () => {
    let chatId: number;
    let hunterId: number;
    let mentions: Mention[];

    let errorMsgPrefix: string;

    beforeEach(() => {
      chatId = faker.random.number();
      hunterId = faker.random.number();
      mentions = [];

      errorMsgPrefix = `[chatId: ${chatId}; hunterId: ${hunterId}]`;
    });

    it('should call mentions service with chatId and mentions array', async () => {
      await controller.registerVictimsCatch(chatId, hunterId, mentions);

      expect(mentionService.getMentionedUsersData).toHaveBeenCalledWith(chatId, mentions);
    });

    it('should throw a NoCatchError error if there are no mentions', async () => {
      mentionService.getMentionedUsersData = jest.fn().mockResolvedValue(new CatchMentions([]));

      const action: Promise<any> = controller.registerVictimsCatch(chatId, hunterId, mentions);

      const expectedMessage = `${errorMsgPrefix} catch doesn't have any mentions`;
      await expect(action).rejects.toEqual(new NoCatchError(expectedMessage));
    });

    it('should throw a CatchHimselfError error if user has captured himself', async () => {
      const victims: User[] = [{ id: hunterId } as User];

      mentionService.getMentionedUsersData = jest.fn().mockResolvedValue(new CatchMentions(victims));

      const action: Promise<any> = controller.registerVictimsCatch(chatId, hunterId, mentions);

      const expectedMessage = `${errorMsgPrefix} hunter has caught himself`;
      await expect(action).rejects.toEqual(new CatchHimselfError(expectedMessage));
    });

    it('should throw an UnverifiedMentionsError error if catch has at least one unverified mention', async () => {
      const unverifiedMentions: User[] = [{} as User];
      mentionService.getMentionedUsersData = jest.fn().mockResolvedValue(new CatchMentions([], unverifiedMentions));

      const action: Promise<any> = controller.registerVictimsCatch(chatId, hunterId, mentions);

      const stringifiedUnverifiedUsers: string = JSON.stringify(unverifiedMentions);
      const expectedMessage = `${errorMsgPrefix} catch have a few unverified users ${stringifiedUnverifiedUsers}`;
      await expect(action).rejects.toEqual(new UnverifiedMentionsError(expectedMessage, unverifiedMentions));
    });

    it('should add catch record', async () => {
      const catchMentions: CatchMentions = new CatchMentions([{} as User]);
      mentionService.getMentionedUsersData = jest.fn().mockResolvedValue(catchMentions);

      await controller.registerVictimsCatch(chatId, hunterId, mentions);

      expect(catchService.addCatchRecord).toHaveBeenCalledWith(chatId, hunterId, catchMentions.victims);
    });

    it('should call store to get chat\'s admin', async () => {
      await controller.registerVictimsCatch(chatId, hunterId, mentions);

      expect(usersStore.getAdminFromChat).toHaveBeenCalledWith(chatId);
    });

    it('should return CatchSummary object', async () => {
      const admin: User = {} as User;
      const catchMentions: CatchMentions = new CatchMentions([{} as User]);
      const catchId: string = faker.random.uuid();

      usersStore.getAdminFromChat = jest.fn().mockResolvedValue(admin);
      catchService.addCatchRecord = jest.fn().mockResolvedValue(catchId);
      mentionService.getMentionedUsersData = jest.fn().mockResolvedValue(catchMentions);

      const result: CatchSummary = await controller.registerVictimsCatch(chatId, hunterId, mentions);

      expect(result.admin).toEqual(admin);
      expect(result.catchId).toEqual(catchId);
      expect(result.victims).toEqual(catchMentions.victims);
      expect(result.unverifiedMentions).toEqual(catchMentions.unverifiedMentions);
    });
  });
});
