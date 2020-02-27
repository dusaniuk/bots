import { createMockContext } from '../../../../test/context.mock';
import { AppContext } from '../../../shared/interfaces';

import { HelpHandler } from './help-handler';


describe('UtilsHandler', () => {
  let handler: HelpHandler;

  let ctx: AppContext;

  beforeEach(() => {
    handler = new HelpHandler();

    ctx = createMockContext();
  });

  describe('getHelp', () => {
    it('should reply with game rules', async () => {
      await handler.handleAction(ctx);

      expect(ctx.replyWithMarkdown).toHaveBeenCalledWith('other.rules');
    });
  });
});
