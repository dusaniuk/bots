import { User } from './user.model';

export interface UsersStore {
  addUserInChat(chatId: number, user: User): Promise<void>;

  isUserInChat(chatId: number, userId: number): Promise<boolean>;

  updateUser(chatId: number, userId: number, props: Omit<Partial<User>, 'id' | 'score'>): Promise<void>;

  getAllUsersFromChat(chatId: number): Promise<User[]>;

  getAllActiveChatsIDs(): Promise<number[]>;

  getUserFromChat(userId: number, chatId: number): Promise<User>;

  updateUserPoints(chatId: number, userId: number, score: number): Promise<void>;
}
