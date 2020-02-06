import { TelegramUser } from '../services/users.firestore';

export interface UsersStore {
  getUser(userId: string): Promise<TelegramUser>;

  saveUser(user: TelegramUser): Promise<void>;
}
