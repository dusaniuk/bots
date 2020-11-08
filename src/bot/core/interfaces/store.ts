import { CatchRecord } from './catch';
import { User } from './user';


export interface CatchStore {
  addCatchRecord(chatId: number, record: CatchRecord): Promise<string>;

  getAllApprovedRecordsInRange(chatId: number, startTimestamp: number, endTimestamp: number): Promise<CatchRecord[]>;

  getCatchRecord(chatId: number, recordId: string): Promise<CatchRecord>;

  approveCatch(chatId: number, recordId: string): Promise<void>;
}

export interface UsersStore {
  addUserInChat(chatId: number, user: User): Promise<void>;

  isUserInChat(chatId: number, userId: number): Promise<boolean>;

  updateUser(chatId: number, userId: number, props: Omit<Partial<User>, 'id'>): Promise<void>;

  getAllUsersFromChat(chatId: number): Promise<User[]>;

  getUserFromChat(userId: number, chatId: number): Promise<User>;

  getAdminFromChat(chatId): Promise<User>;
}
