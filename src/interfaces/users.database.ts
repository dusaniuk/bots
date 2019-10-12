import { Hunter, CaptureRecord } from '../models';

export interface UsersDatabase {
  addUserInChat(chatId: number, hunter: Hunter): Promise<void>;
  isUserInChat(chatId: number, userId: number): Promise<boolean>;

  getAllUsersFromChat(chatId: number): Promise<Hunter[]>;
  getUserFromChat(userId: number, chatId: number): Promise<Hunter>;
  updateUserPoints(chatId: number, id: number, score: number): Promise<void>;

  addCaptureRecord(chatId: number, record: CaptureRecord): Promise<string>;
  getCaptureRecord(chatId: number, recordId: string): Promise<CaptureRecord>;

  getAllActiveChatsIDs(): Promise<number[]>;
}
