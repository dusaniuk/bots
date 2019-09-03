import { User } from './user.model';

export interface CaptureRecord {
  hunterId: number;
  chatId: number;
  victims: User[];
}
