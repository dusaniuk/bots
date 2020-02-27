import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';

import { User } from '../../core/interfaces/user';

import { ContextParser, TelegramReplyService } from '../services';
import { ActionHandler } from '../interfaces/action-handler';


@injectable()
export class LeftMemberHandler implements ActionHandler {
  private telegrafReply: TelegramReplyService;

  constructor(
    @inject(TYPES.CONTEXT_PARSER) private parser: ContextParser,
  ) {}

  handleAction = async (ctx: AppContext): Promise<any> => {
    this.telegrafReply = new TelegramReplyService(ctx);

    const leftMember: User = this.parser.mapToUserEntity(ctx.message.left_chat_member);
    await this.telegrafReply.sayFarewellToLeftMember(leftMember);
  };
}
