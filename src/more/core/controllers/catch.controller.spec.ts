import * as faker from 'faker';

import { User } from '../interfaces/user';
import { UsersStore } from '../interfaces/store';
import { ActionResult } from '../models/action-result';
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
      const catchResult: CatchResult = {} as CatchResult;
      catchService.approveCatch = jest.fn().mockResolvedValue(catchResult);

      const result: ActionResult = await controller.approveCatch(chatId, catchId);

      expect(result.ok).toBeTruthy();
      expect(result.payload).toEqual(catchResult);
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
      const catchResult: CatchResult = {} as CatchResult;
      catchService.rejectCatch = jest.fn().mockResolvedValue(catchResult);

      const result: ActionResult = await controller.rejectCatch(chatId, catchId);

      expect(result.ok).toBeTruthy();
      expect(result.payload).toEqual(catchResult);
    });
  });
  describe('registerVictimsCatch', () => {
    let chatId: number;
    let hunterId: number;
    let mentions: Mention[];

    beforeEach(() => {
      chatId = faker.random.number();
      hunterId = faker.random.number();
      mentions = [];
    });

    it('should call mentions service with chatId and mentions array', async () => {
      await controller.registerVictimsCatch(chatId, hunterId, mentions);

      expect(mentionService.getMentionedUsersData).toHaveBeenCalledWith(chatId, mentions);
    });

    it('should return an error if there are no mentions', async () => {
      mentionService.getMentionedUsersData = jest.fn().mockResolvedValue(new CatchMentions([]));

      const result: ActionResult = await controller.registerVictimsCatch(chatId, hunterId, mentions);

      expect(result.ok).toBeFalsy();
      expect(result.error instanceof NoCatchError).toBeTruthy();
    });

    it('should return an error if user has captured himself', async () => {
      const victims: User[] = [{ id: hunterId } as User];

      mentionService.getMentionedUsersData = jest.fn().mockResolvedValue(new CatchMentions(victims));

      const result: ActionResult = await controller.registerVictimsCatch(chatId, hunterId, mentions);

      expect(result.ok).toBeFalsy();
      expect(result.error instanceof CatchHimselfError).toBeTruthy();
    });

    it('should return an error if catch has at least one unverified mention', async () => {
      const unverifiedMentions: User[] = [{} as User];

      mentionService.getMentionedUsersData = jest.fn().mockResolvedValue(new CatchMentions([], unverifiedMentions));

      const result: ActionResult = await controller.registerVictimsCatch(chatId, hunterId, mentions);

      expect(result.ok).toBeFalsy();
      expect(result.error instanceof UnverifiedMentionsError).toBeTruthy();
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

      const result: ActionResult<CatchSummary> = await controller.registerVictimsCatch(chatId, hunterId, mentions);

      expect(result.ok).toBeTruthy();
      expect(result.payload.admin).toEqual(admin);
      expect(result.payload.catchId).toEqual(catchId);
      expect(result.payload.victims).toEqual(catchMentions.victims);
      expect(result.payload.unverifiedMentions).toEqual(catchMentions.unverifiedMentions);
    });
  });
});
