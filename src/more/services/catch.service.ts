import { inject, injectable } from 'inversify';

import { TYPES } from '../ioc/types';

import { User } from '../core/interfaces/user';
import { CatchStore, UsersStore } from '../core/interfaces/store';
import { CatchRecord, CatchResult } from '../core/interfaces/catch';


@injectable()
export class CatchService {
  constructor(
    @inject(TYPES.CATCH_STORE) private catchStore: CatchStore,
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
  ) {}

  addCatchRecord = (chatId: number, hunterId: number, victims: User[]): Promise<string> => {
    const record: CatchRecord = this.createCatchRecord(hunterId, victims);

    return this.catchStore.addCatchRecord(chatId, record);
  };

  approveCatch = async (chatId: number, catchId: string): Promise<CatchResult> => {
    await this.catchStore.approveCatch(chatId, catchId);

    return this.getCatchResult(chatId, catchId);
  };

  rejectCatch = (chatId: number, catchId: string): Promise<CatchResult> => {
    // TODO: consider failed catch deletion so they won't waste space

    return this.getCatchResult(chatId, catchId);
  };

  private createCatchRecord = (hunterId: number, victims: User[]): CatchRecord => {
    return {
      hunterId,
      approved: false,
      timestamp: new Date().getTime(),
      victims: victims.map((user: User) => user.id),
      points: victims.length * 4,
    };
  };

  private getCatchResult = async (chatId: number, catchId: string): Promise<CatchResult> => {
    const catchRecord: CatchRecord = await this.catchStore.getCatchRecord(chatId, catchId);
    const hunter = await this.usersStore.getUserFromChat(catchRecord.hunterId, chatId);

    return {
      hunter,
      earnedPoints: catchRecord.points,
    };
  };
}
