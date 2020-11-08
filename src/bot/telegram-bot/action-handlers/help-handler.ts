import { injectable } from 'inversify';

import { BaseActionHandler } from './base/base-action-handler';


@injectable()
export class HelpHandler extends BaseActionHandler {
  protected handleAction = async (): Promise<void> => {
    await this.replyService.showGameRules();
  };
}
