import * as faker from 'faker';

import { UsersStore } from '../core/interfaces/store';
import { Mention } from '../core/interfaces/catch';
import { User } from '../core/interfaces/user';

import { MentionsService } from './mentions.service';


describe('MentionsService', () => {
  let service: MentionsService;

  let usersStore: UsersStore;

  beforeEach(() => {
    jest.clearAllMocks();

    usersStore = {
      getAllUsersFromChat: jest.fn(),
    } as any;

    service = new MentionsService(usersStore);
  });

  describe('getMentionsFromContext', () => {
    let chatId: number;

    beforeEach(() => {
      chatId = faker.random.number();
    });

    it('should call users store to get users from chat', async () => {
      await service.getMentionedUsersData(chatId);

      expect(usersStore.getAllUsersFromChat).toHaveBeenCalledWith(chatId);
    });

    it('should map mentioned users by username and by text to user from store', async () => {
      const username = faker.internet.userName();
      const userId = faker.random.number();

      const mentions: Mention[] = [{ username }, { id: userId }];
      const storeResponse: User[] = [{
        id: faker.random.number(),
        firstName: faker.name.firstName(),
        username,
      }, {
        id: userId,
        firstName: faker.name.firstName(),
        username: faker.internet.userName(),
      }];

      usersStore.getAllUsersFromChat = jest.fn().mockResolvedValue(storeResponse);

      const result = await service.getMentionedUsersData(chatId, mentions);

      expect(result.victims).toHaveLength(2);
      expect(result.unverifiedMentions).toHaveLength(0);
      expect(result.victims[0]).toEqual(storeResponse[0]);
      expect(result.victims[1]).toEqual(storeResponse[1]);
    });

    it('should mark users as unverified if they are not in store', async () => {
      const userId = faker.random.number();
      const username = faker.internet.userName();

      const mentions: Mention[] = [{ id: userId }, { username }];

      usersStore.getAllUsersFromChat = jest.fn().mockResolvedValue([]);

      const result = await service.getMentionedUsersData(chatId, mentions);

      expect(result.victims).toHaveLength(0);
      expect(result.unverifiedMentions).toHaveLength(2);
      expect(result.unverifiedMentions[0]).toEqual(mentions[0]);
      expect(result.unverifiedMentions[1]).toEqual(mentions[1]);
    });
  });
});
