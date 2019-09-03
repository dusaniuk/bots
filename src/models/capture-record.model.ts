import { Hunter } from './hunter.model';

export interface CaptureRecord {
  hunterId: number;
  chatId: number;
  victims: Hunter[];
}
