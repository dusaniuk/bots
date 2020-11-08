import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';

import { IUsersController } from '../../core/interfaces/controllers';

import { TelegramReplyService } from '../services';
import { BaseActionHandler } from './base/base-action-handler';


@injectable()
export class UpdateHandler extends BaseActionHandler {
  constructor(
    @inject(TYPES.USERS_CONTROLLER) private usersController: IUsersController,
  ) {
    super();
  }

  protected handleAction = async (ctx: AppContext): Promise<void> => {
    this.replyService = new TelegramReplyService(ctx);

    const { from, chat }: AppContext = ctx;

    await this.usersController.updateUserDataInChat(chat.id, from.id, {
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name ?? null,
    });

    return this.replyService.showSuccessUpdate();
  };
}
