import { Hunter } from '../models/hunter.model';
import { CaptureRecord } from '../models/capture-record.model';

export interface UsersDatabase {
  isUserInChat(userId: number, chatId: number): Promise<boolean>;
  addUserInChat(user: Hunter, chatId: number): Promise<void>;
  getAllUsersFromChat(chatId: number): Promise<Hunter[]>;
  addCaptureRecord(record: CaptureRecord): Promise<void>;
}
