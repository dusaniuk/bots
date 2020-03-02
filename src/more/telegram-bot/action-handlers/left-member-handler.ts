import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';

import { User } from '../../core/interfaces/user';

import { ContextParser } from '../services';
import { BaseActionHandler } from './base/base-action-handler';


@injectable()
export class LeftMemberHandler extends BaseActionHandler {
  constructor(
    @inject(TYPES.CONTEXT_PARSER) private parser: ContextParser,
  ) {
    super();
  }

  protected handleAction = async (ctx: AppContext): Promise<void> => {
    const leftMember: User = this.parser.mapToUserEntity(ctx.message.left_chat_member);

    await this.replyService.sayFarewellToLeftMember(leftMember);
  };
}
