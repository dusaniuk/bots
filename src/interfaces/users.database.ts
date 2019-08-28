import { Hunter } from '../models/hunter.model';

export interface UsersDatabase {
  isUserInChat(userId: number, chatId: number): Promise<boolean>;
  addUserInChat(user: Hunter, chatId: number): Promise<void>;
}
