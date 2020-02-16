import { User, UserWithScore } from '../../interfaces';
import { ActionResult } from '../models/actionResult';

export interface UsersPresenter {
  isUserInGame(chatId: number, userId: number): Promise<ActionResult>;

  addUserToGame(chatId: number, user: User): Promise<ActionResult>;

  updateUserDataInChat(chatId: number, userId: number, props: Omit<User, 'id'>): Promise<ActionResult>;
}

export type Score = UserWithScore[];

export interface ScorePresenter {
  getSortedScoreForChat(chatId: number): Promise<ActionResult<Score>>;
}
