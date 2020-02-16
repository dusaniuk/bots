import { inject, injectable } from 'inversify';

import { ScorePresenter } from '../interfaces/controllers';
import { TYPES } from '../../ioc/types';
import { ScoreService } from '../../services';
import { ScoreItem, User, UsersStore, UserWithScore } from '../../interfaces';
import { ActionResult } from '../models/actionResult';
import { Score } from '../models/score';

@injectable()
export class ScoreController implements ScorePresenter {
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
