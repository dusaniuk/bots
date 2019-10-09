import { Hunter, User, CaptureRecord } from '../models';

export interface UsersDatabase {
  isUserInChat(userId: number, chatId: number): Promise<boolean>;
  addUserInChat(hunter: Hunter): Promise<void>;
  getAllUsersFromChat(chatId: number): Promise<Hunter[]>;
  getUserFromChat(userId: number, chatId: number): Promise<{ id: string; user: Hunter }>;
  updateUserPoints(id: string, score: number): Promise<void>;

  addCaptureRecord(record: CaptureRecord): Promise<string>;
  getCaptureRecord(recordId: string): Promise<CaptureRecord>;

  getAllActiveChatsIDs(): Promise<number[]>;
}
