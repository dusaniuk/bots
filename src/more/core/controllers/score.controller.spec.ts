import * as faker from 'faker';

import { ScoreController } from './score.controller';
import { ScoreService } from '../../services';
import { ScoreItem, User, UsersStore } from '../../interfaces';
import { ActionResult } from '../models/actionResult';

describe('ScoreController', () => {
  let controller: ScoreController;

  let scoreService: ScoreService;
  let usersStore: UsersStore;

  beforeEach(() => {
    scoreService = {
      getUsersScore: jest.fn(),
    } as any;

    usersStore = {
      getAllUsersFromChat: jest.fn(),
    } as any;

    controller = new ScoreController(scoreService, usersStore);
  });

  describe('getSortedScoreForChat', () => {
    let chatId: number;

    beforeEach(() => {
      chatId = faker.random.number();
    });

    it('should call store to get score', async () => {
      await controller.getSortedScoreForChat(chatId);

      expect(scoreService.getUsersScore).toHaveBeenCalledWith(chatId);
    });

    it('should call store to get users from chat', async () => {
      await controller.getSortedScoreForChat(chatId);

      expect(scoreService.getUsersScore).toHaveBeenCalledWith(chatId);
    });

    it('should return success response', async () => {
      const scoreItems: ScoreItem[] = [
        { hunterId: faker.random.number(), points: 50 },
        { hunterId: faker.random.number(), points: 100 },
      ];

      const users: User[] = [
        { id: scoreItems[0].hunterId } as User,
        { id: scoreItems[1].hunterId } as User,
      ];

      scoreService.getUsersScore = jest.fn().mockResolvedValue(scoreItems);
      usersStore.getAllUsersFromChat = jest.fn().mockResolvedValue(users);

      const result: ActionResult = await controller.getSortedScoreForChat(chatId);

      expect(result.ok).toBeTruthy();
      expect(result.payload).toEqual([
        { user: users[1], points: scoreItems[1].points },
        { user: users[0], points: scoreItems[0].points },
      ]);
    });
  });
});
