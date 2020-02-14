import { User } from './user.model';

export interface UsersStore {
  addUserInChat(chatId: number, user: User): Promise<void>;

  isUserInChat(chatId: number, userId: number): Promise<boolean>;

  updateUser(chatId: number, userId: number, props: Omit<Partial<User>, 'id'>): Promise<void>;

  getAllUsersFromChat(chatId: number): Promise<User[]>;

  getUserFromChat(userId: number, chatId: number): Promise<User>;
}
