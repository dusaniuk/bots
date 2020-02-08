import * as faker from 'faker';

import { CatchService } from './catch.service';
import { CatchStore, User } from '../interfaces';

describe('CatchService', () => {
  let service: CatchService;

  let catchStore: CatchStore;

  beforeEach(() => {
    jest.clearAllMocks();

    catchStore = {
      addCatchRecord: jest.fn(),
    } as any;

    service = new CatchService(catchStore);
  });

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
