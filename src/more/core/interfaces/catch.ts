import { Actions } from '../../telegram-bot/constants/actions';
import { User } from './user';


export interface AdminDecision {
  action: Actions;
  catchId: string;
  chatId: number;
}

export interface CatchSummary {
  victims: User[];
  unverifiedMentions?: Mention[];
  admin: User;
  catchId: string;
}

export interface CatchRecord {
  approved?: boolean;
  hunterId: number;
  timestamp: number;
  victims: number[];
  points?: number;
}

export interface CatchResult {
  hunter: User;
  earnedPoints: number;
}

export interface Mention {
  id?: number;
  username?: string;
}
