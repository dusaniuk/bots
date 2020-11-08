import { injectable } from 'inversify';

import { BaseActionHandler } from './base/base-action-handler';


@injectable()
export class PingHandler extends BaseActionHandler {
  protected handleAction = (): Promise<any> => {
    return this.replyService.ping();
  };
}
