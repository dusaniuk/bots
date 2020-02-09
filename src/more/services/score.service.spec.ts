import * as faker from 'faker';

import { ScoreService } from './score.service';
import { CatchRecord, CatchStore, ScoreItem } from '../interfaces';

const makeMockCatchRecord = (hunterId: number, points: number, victims?: number[]): CatchRecord => {
  return {
    hunterId,
    points,
    victims: victims ?? [],
    timestamp: faker.random.number(),
    approved: true,
  };
};

describe('ScoreService', () => {
  let service: ScoreService;

  let catchStore: CatchStore;

  beforeEach(() => {
    catchStore = {
      getAllApprovedRecordsInRange: jest.fn(),
    } as any;

    service = new ScoreService(catchStore);
  });

  describe('getUsersScore', () => {
    let chatId: number;

    beforeEach(() => {
      chatId = faker.random.number();
    });

    it('should call catch store to get records in range from beginning of the curr year till EOD', async () => {
      const now: Date = new Date();

      const tzHoursOffset = (now.getTimezoneOffset() * -1) / 60;
      const startYearTimestamp: number = new Date(now.getFullYear(), 0, 1, tzHoursOffset).getTime();

      const eodTimestamp: number = now.setHours(23 + tzHoursOffset, 59, 59, 599);

      await service.getUsersScore(chatId);

      expect(catchStore.getAllApprovedRecordsInRange).toHaveBeenCalledWith(chatId, startYearTimestamp, eodTimestamp);
    });

    it('should form 3 score items with catch results', async () => {
      const firstHunterId: number = faker.random.number();
      const secondHunterId: number = faker.random.number();
      const thirdHunter: number = faker.random.number();

      const mockCatchRecords: CatchRecord[] = [
        makeMockCatchRecord(firstHunterId, 4),
        makeMockCatchRecord(secondHunterId, 8),
        makeMockCatchRecord(secondHunterId, 12),
        makeMockCatchRecord(thirdHunter, 4),
        makeMockCatchRecord(firstHunterId, 24),
      ];
      catchStore.getAllApprovedRecordsInRange = jest.fn().mockResolvedValue(mockCatchRecords);


      const result: ScoreItem[] = await service.getUsersScore(chatId);


      expect(result).toHaveLength(3);

      result.sort((a: ScoreItem, b: ScoreItem) => b.points - a.points);
      expect(result[0]).toEqual({ hunterId: firstHunterId, points: 28 });
      expect(result[1]).toEqual({ hunterId: secondHunterId, points: 20 });
      expect(result[2]).toEqual({ hunterId: thirdHunter, points: 4 });
    });
  });
});
