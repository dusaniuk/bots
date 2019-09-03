import { User } from './user.model';

export interface Hunter extends User {
  chatId: number;
}
