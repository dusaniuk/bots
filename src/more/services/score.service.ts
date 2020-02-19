import { inject, injectable } from 'inversify';

import { TYPES } from '../ioc/types';
import { CatchRecord, ScoreItem } from '../interfaces';
import { CatchStore } from '../core/interfaces/store';

interface ScoreObject {
  [key: number]: number;
}

@injectable()
export class ScoreService {
  constructor(
    @inject(TYPES.CATCH_STORE) private catchStore: CatchStore,
  ) {}

  public getUsersScore = async (chatId: number): Promise<ScoreItem[]> => {
    const startTimestamp: number = this.getStartOfCurrentYearTimestamp();
    const endTimestamp: number = this.getEndOfDayTimestamp();

    const catchRecords: CatchRecord[] = await this.catchStore.getAllApprovedRecordsInRange(chatId, startTimestamp, endTimestamp);

    return this.getScoreItemsFromCatchRecords(catchRecords);
  };

  private getStartOfCurrentYearTimestamp = (): number => {
    const now = new Date();

    const currentYear: number = now.getFullYear();
    const tzHoursOffset: number = (now.getTimezoneOffset() * -1) / 60;

    const startOfYearDate: Date = new Date(currentYear, 0, 1, tzHoursOffset);
    return startOfYearDate.getTime();
  };

  private getEndOfDayTimestamp = (): number => {
    const now = new Date();
    const tzHoursOffset: number = (now.getTimezoneOffset() * -1) / 60;

    now.setHours(23 + tzHoursOffset, 59, 59, 599);

    return now.getTime();
  };

  private getScoreItemsFromCatchRecords = (catchRecords: CatchRecord[] = []): ScoreItem[] => {
    const score: ScoreObject = {};

    catchRecords.forEach((record: CatchRecord) => {
      score[record.hunterId] = (score[record.hunterId] ?? 0) + record.points;
    });

    return Object.keys(score).map((hunterId: string): ScoreItem => {
      return { hunterId: +hunterId, points: score[hunterId] };
    });
  };
}
