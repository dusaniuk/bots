import { createMockContext } from '../../../../test/context.mock';
import { AppContext } from '../../../shared/interfaces';

import { PingHandler } from './ping-handler';

describe('PingHandler', () => {
  let handler: PingHandler;

  let ctx: AppContext;

  beforeEach(() => {
    handler = new PingHandler();

    ctx = createMockContext();
  });

  describe('handleAction', () => {
    it('should reply with other.ping message', async () => {
      await handler.execute(ctx);

      expect(ctx.replyWithMarkdown).toHaveBeenCalledWith('other.ping');
    });
  });
});
