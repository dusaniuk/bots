import * as faker from 'faker';

import { CatchController} from './catch.controller';
import { Mention, User, UsersStore } from '../../interfaces';
import { CatchService, MentionsService } from '../../services';
import { ActionResult } from '../models/actionResult';
import { CatchMentions } from '../../models';
import { CatchHimselfError, NoCatchError, UnverifiedMentionsError } from '../errors';
import { CatchSummary } from '../interfaces/catch';

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
    } as any;

    mentionService = {
      getMentionedUsersData: jest.fn().mockResolvedValue(new CatchMentions([{} as User])),
    } as any;

    controller = new CatchController(usersStore, catchService, mentionService);
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
