import { TelegramUser } from '../store/users.firestore';

export interface UsersStore {
  getUser(userId: string): Promise<TelegramUser>;

  saveUser(user: TelegramUser): Promise<void>;
}
