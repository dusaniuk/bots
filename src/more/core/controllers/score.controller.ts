import { inject, injectable } from 'inversify';

import { TYPES } from '../../types';
import { ScoreService } from '../service';
import { ActionResult } from '../models/actionResult';

import { UsersStore } from '../interfaces/store';
import { IScoreController } from '../interfaces/controllers';
import { Score, ScoreItem, User, UserWithScore } from '../interfaces/user';


@injectable()
export class ScoreController implements IScoreController {
  constructor(
    @inject(TYPES.SCORE_SERVICE) private scoreService: ScoreService,
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
  ) {}

  getSortedScoreForChat = async (chatId: number): Promise<ActionResult<Score>> => {
    const [scoreItems = [], users = []] = await Promise.all([
      this.scoreService.getUsersScore(chatId),
      this.usersStore.getAllUsersFromChat(chatId),
    ]);

    const sortedScore: Score = scoreItems
      .map((item: ScoreItem) => {
        const user = users.find((u: User) => u.id === item.hunterId);
        return { user, points: item.points };
      })
      .sort((a: UserWithScore, b: UserWithScore) => b.points - a.points);

    return ActionResult.success(sortedScore);
  };
}
