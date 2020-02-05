import { CatchRecord } from './catch-record.model';

export interface CatchStore {
  addCatchRecord(chatId: number, record: CatchRecord): Promise<string>;

  getCatchRecord(chatId: number, recordId: string): Promise<CatchRecord>;

  approveCatch(chatId: number, recordId: string): Promise<void>;
}
