import { injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';

import { ActionHandler } from '../interfaces/action-handler';
import { TelegramReplyService } from '../services';


@injectable()
export class PingHandler implements ActionHandler {
  private telegrafReply: TelegramReplyService;

  handleAction = (ctx: AppContext): Promise<any> => {
    this.telegrafReply = new TelegramReplyService(ctx);

    return this.telegrafReply.ping();
  };
}
