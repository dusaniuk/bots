import { CatchResult, Mention, User } from '../../interfaces';
import { ActionResult } from '../models/actionResult';
import { Score } from '../models/score';
import { CatchSummary } from './catch';

export interface IUsersController {
  isUserInGame(chatId: number, userId: number): Promise<ActionResult>;

  addUserToGame(chatId: number, user: User): Promise<ActionResult>;

  updateUserDataInChat(chatId: number, userId: number, props: Omit<User, 'id'>): Promise<ActionResult>;
}

export interface IScoreController {
  getSortedScoreForChat(chatId: number): Promise<ActionResult<Score>>;
}

export interface ICatchController {
  registerVictimsCatch(chatId: number, hunterId: number, mentions: Mention[]): Promise<ActionResult<CatchSummary>>;

  approveCatch(chatId: number, catchId: string): Promise<ActionResult<CatchResult>>;

  rejectCatch(chatId: number, catchId: string): Promise<ActionResult<CatchResult>>;
}
