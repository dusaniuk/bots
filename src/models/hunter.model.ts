import { User } from './user.model';

export interface Hunter extends User {
  score?: number;
  isAdmin?: boolean;
}
