import { Hunter, User, CaptureRecord } from '../models';

export interface UsersDatabase {
  isUserInChat(userId: number, chatId: number): Promise<boolean>;
  addUserInChat(hunter: Hunter): Promise<void>;
  getAllUsersFromChat(chatId: number): Promise<User[]>;
  addCaptureRecord(record: CaptureRecord): Promise<void>;
}
