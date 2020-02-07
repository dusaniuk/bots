import * as faker from 'faker';

import { MentionsService } from './mentions.service';
import { AppContext } from '../../shared/interfaces';
import { createMockContext } from '../../../test/context.mock';
import { MentionsParser } from './mentions.parser';
import { Mention, User, UsersStore } from '../interfaces';

describe('MentionsService', () => {
  let service: MentionsService;

  let parser: MentionsParser;
  let usersStore: UsersStore;

  let ctx: AppContext;

  beforeEach(() => {
    jest.clearAllMocks();

    parser = {
      getMentionsFromContext: jest.fn(),
    } as any;
    usersStore = {
      getAllUsersFromChat: jest.fn(),
    } as any;

    service = new MentionsService(parser, usersStore);

    ctx = createMockContext();
    ctx.chat = { ...ctx.chat, id: faker.random.number() };
    ctx.from = { ...ctx.from, id: faker.random.number() };
  });

  describe('getMentionsFromContext', () => {
    it('should call context parser with context itself', async () => {
      await service.getMentionsFromContext(ctx);

      expect(parser.getMentionsFromContext).toHaveBeenCalledWith(ctx);
    });

    it('should call users store to get users from chat', async () => {
      await service.getMentionsFromContext(ctx);

      expect(usersStore.getAllUsersFromChat).toHaveBeenCalledWith(ctx.chat.id);
    });

    it('should map mentioned user by username to user from store', async () => {
      const username = faker.internet.userName();

      const parserResponse: Mention[] = [{ username }];
      const storeResponse: User[] = [{
        id: faker.random.number(),
        firstName: faker.name.firstName(),
        username,
      }];

      parser.getMentionsFromContext = jest.fn().mockReturnValue(parserResponse);
      usersStore.getAllUsersFromChat = jest.fn().mockResolvedValue(storeResponse);

      const result = await service.getMentionsFromContext(ctx);

      expect(result.victims).toHaveLength(1);
      expect(result.unverifiedMentions).toHaveLength(0);
      expect(result.victims[0]).toEqual(storeResponse[0]);
    });

    it('should map mentioned user by text to user from store', async () => {
      const userId = faker.random.number();

      const parserResponse: Mention[] = [{ id: userId }];
      const storeResponse: User[] = [{
        id: userId,
        firstName: faker.name.firstName(),
        username: faker.internet.userName(),
      }];

      parser.getMentionsFromContext = jest.fn().mockReturnValue(parserResponse);
      usersStore.getAllUsersFromChat = jest.fn().mockResolvedValue(storeResponse);

      const result = await service.getMentionsFromContext(ctx);

      expect(result.victims).toHaveLength(1);
      expect(result.unverifiedMentions).toHaveLength(0);
      expect(result.victims[0]).toEqual(storeResponse[0]);
    });

    it('should mark users as unverified if they are not in store', async () => {
      const userId = faker.random.number();
      const username = faker.internet.userName();

      const parserResponse: Mention[] = [{ id: userId }, { username }];

      parser.getMentionsFromContext = jest.fn().mockReturnValue(parserResponse);
      usersStore.getAllUsersFromChat = jest.fn().mockResolvedValue([]);

      const result = await service.getMentionsFromContext(ctx);

      expect(result.victims).toHaveLength(0);
      expect(result.unverifiedMentions).toHaveLength(2);
      expect(result.unverifiedMentions[0]).toEqual(parserResponse[0]);
      expect(result.unverifiedMentions[1]).toEqual(parserResponse[1]);
    });

    it('should set admin id', async () => {
      const userId = faker.random.number();

      const parserResponse: Mention[] = [];
      const storeResponse: User[] = [{
        id: userId,
        firstName: faker.name.firstName(),
        username: faker.internet.userName(),
        isAdmin: true,
      }];

      parser.getMentionsFromContext = jest.fn().mockReturnValue(parserResponse);
      usersStore.getAllUsersFromChat = jest.fn().mockResolvedValue(storeResponse);

      const result = await service.getMentionsFromContext(ctx);

      expect(result.admin).toEqual(storeResponse[0]);
    });

    it('should set hunter', async () => {
      const parserResponse: Mention[] = [];
      const storeResponse: User[] = [{
        id: ctx.from.id,
        firstName: faker.name.firstName(),
        username: faker.internet.userName(),
      }];

      parser.getMentionsFromContext = jest.fn().mockReturnValue(parserResponse);
      usersStore.getAllUsersFromChat = jest.fn().mockResolvedValue(storeResponse);

      const result = await service.getMentionsFromContext(ctx);

      expect(result.hunter).toEqual(storeResponse[0]);
    });
  });
});
