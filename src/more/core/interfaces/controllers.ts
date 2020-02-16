import { User } from '../../interfaces';
import { ActionResult } from '../models/actionResult';
import { Score } from '../models/score';

export interface UsersPresenter {
  isUserInGame(chatId: number, userId: number): Promise<ActionResult>;

  addUserToGame(chatId: number, user: User): Promise<ActionResult>;

  updateUserDataInChat(chatId: number, userId: number, props: Omit<User, 'id'>): Promise<ActionResult>;
}

export interface ScorePresenter {
  getSortedScoreForChat(chatId: number): Promise<ActionResult<Score>>;
}
