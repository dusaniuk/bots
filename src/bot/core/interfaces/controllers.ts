import { CatchResult, CatchSummary, Mention } from './catch';
import { User, Score } from './user';


export interface IUsersController {
  addUserToGame(chatId: number, user: User): Promise<void>;

  updateUserDataInChat(chatId: number, userId: number, props: Omit<User, 'id'>): Promise<void>;
}

export interface IScoreController {
  getSortedScoreForChat(chatId: number): Promise<Score>;
}

export interface ICatchController {
  approveCatch(chatId: number, catchId: string): Promise<CatchResult>;

  rejectCatch(chatId: number, catchId: string): Promise<CatchResult>;

  registerVictimsCatch(chatId: number, hunterId: number, mentions: Mention[]): Promise<CatchSummary>;
}
