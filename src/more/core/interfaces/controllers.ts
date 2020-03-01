import { ActionResult } from '../models/action-result';
import { CatchResult, CatchSummary, Mention } from './catch';
import { User, Score } from './user';


export interface IUsersController {
  isUserInGame(chatId: number, userId: number): Promise<ActionResult>;

  addUserToGame(chatId: number, user: User): Promise<ActionResult>;

  updateUserDataInChat(chatId: number, userId: number, props: Omit<User, 'id'>): Promise<ActionResult>;
}

export interface IScoreController {
  getSortedScoreForChat(chatId: number): Promise<Score>;
}

export interface ICatchController {
  approveCatch(chatId: number, catchId: string): Promise<CatchResult>;

  rejectCatch(chatId: number, catchId: string): Promise<CatchResult>;

  registerVictimsCatch(chatId: number, hunterId: number, mentions: Mention[]): Promise<CatchSummary>;
}
