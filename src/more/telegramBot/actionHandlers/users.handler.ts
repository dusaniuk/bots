import { User as TelegrafUser } from 'telegraf/typings/telegram-types';
import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';

import { ChatType } from '../constants/chatType';
import { User, Score } from '../../core/interfaces/user';
import { ActionResult } from '../../core/models/actionResult';
import { AlreadyInGameError, NotInGameError } from '../../core/errors';
import { UsersController, ScoreController } from '../../core/controllers';

import { createUser, getGreetingNameForUser, getUsersScore } from '../utils/helpers';


@injectable()
export class UsersHandler {
  constructor(
    @inject(TYPES.USERS_CONTROLLER) private usersController: UsersController,
    @inject(TYPES.SCORE_CONTROLLER) private scoreController: ScoreController,
  ) {}

  register = async (ctx: AppContext): Promise<any> => {
    if (ctx.chat.type === ChatType.private) {
      return ctx.reply(ctx.i18n.t('error.rejectPrivate'));
    }

    const user: User = createUser(ctx.from);
    const result: ActionResult = await this.usersController.addUserToGame(ctx.chat.id, user);

    if (result?.error instanceof AlreadyInGameError) {
      return ctx.reply(ctx.i18n.t('error.alreadyInGame'));
    }

    return ctx.reply(
      ctx.i18n.t('user.greetNew', {
        user: getGreetingNameForUser(user),
      }),
    );
  };

  update = async (ctx: AppContext): Promise<any> => {
    const { from, chat }: AppContext = ctx;

    const result: ActionResult = await this.usersController.updateUserDataInChat(chat.id, from.id, {
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name ?? null,
    });

    if (result?.error instanceof NotInGameError) {
      return ctx.reply(ctx.i18n.t('error.notInGame'));
    }

    return ctx.reply(ctx.i18n.t('user.successUpdate'));
  };

  getScore = async (ctx: AppContext): Promise<any> => {
    const result: ActionResult<Score> = await this.scoreController.getSortedScoreForChat(ctx.chat.id);

    if (result.ok) {
      await ctx.reply(
        ctx.i18n.t('user.score', {
          score: getUsersScore(result.payload),
        }),
      );
    }
  };

  onNewMemberInChat = async (ctx: AppContext): Promise<void> => {
    const newMembers: User[] = this.getNewMembers(ctx);

    for (const user of newMembers) {
      const result: ActionResult = await this.usersController.isUserInGame(ctx.chat.id, user.id);

      if (result.ok) {
        await ctx.reply(ctx.i18n.t('user.welcomeBack'));
      } else {
        await this.usersController.addUserToGame(ctx.chat.id, user);
      }
    }
  };

  onLeftChatMember = async (ctx: AppContext): Promise<any> => {
    const leftMember = createUser(ctx.message.left_chat_member);

    await ctx.reply(ctx.i18n.t('user.onLeft', {
      user: getGreetingNameForUser(leftMember),
    }));
  };

  private getNewMembers = (ctx: AppContext): User[] => {
    const newUsers: TelegrafUser[] = (ctx.message?.new_chat_members ?? []).filter((user) => !user.is_bot);
    return newUsers.map(createUser);
  };
}
