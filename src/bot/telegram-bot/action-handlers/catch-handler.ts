import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';

import { User } from '../../core/interfaces/user';
import { CatchSummary, Mention } from '../../core/interfaces/catch';
import { ICatchController } from '../../core/interfaces/controllers';

import { ContextParser } from '../services';
import { BaseActionHandler } from './base/base-action-handler';


@injectable()
export class CatchHandler extends BaseActionHandler {
  constructor(
    @inject(TYPES.CONTEXT_PARSER) private parser: ContextParser,
    @inject(TYPES.CATCH_CONTROLLER) private catchController: ICatchController,
  ) {
    super();
  }


  protected handleAction = async (ctx: AppContext): Promise<void> => {
    await this.catchVictims(ctx);
  };

  private catchVictims = async (ctx: AppContext): Promise<void> => {
    const { chat: { id: chatId }, from }: AppContext = ctx;
    const mentions: Mention[] = await this.parser.getMentionsFromContext(ctx);

    // TODO: add chat entity and refer it in hunter entity
    const hunter: User = this.parser.mapToUserEntity(from);
    const catchSummary: CatchSummary = await this.catchController.registerVictimsCatch(chatId, hunter.id, mentions);

    await Promise.all([
      this.replyService.notifyAdminAboutCatch(hunter, catchSummary),
      this.replyService.notifyChatAboutCatch(hunter, catchSummary),
    ]);
  };
}
