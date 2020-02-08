import { inject, injectable } from 'inversify';

import { TYPES } from '../ioc/types';
import { CatchRecord, CatchStore, User } from '../interfaces';

@injectable()
export class CatchService {
  constructor(
    @inject(TYPES.CATCH_STORE) private catchStore: CatchStore,
  ) {}

  addCatchRecord = (chatId: number, hunterId: number, victims: User[]): Promise<string> => {
    const record: CatchRecord = this.createCatchRecord(hunterId, victims);

    return this.catchStore.addCatchRecord(chatId, record);
  };

  private createCatchRecord = (hunterId: number, victims: User[]): CatchRecord => {
    return {
      hunterId,
      approved: false,
      timestamp: new Date().getTime(),
      victims: victims.map((user: User) => user.id),
      points: victims.length * 4,
    };
  }
}
