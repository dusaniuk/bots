import { injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { ActionHandler } from '../interfaces/action-handler';
import { TelegramReplyService } from '../services';


@injectable()
export class HelpHandler implements ActionHandler {
  private telegrafReply: TelegramReplyService;

  handleAction = async (ctx: AppContext): Promise<void> => {
    this.telegrafReply = new TelegramReplyService(ctx);

    await this.telegrafReply.showGameRules();
  };
}
