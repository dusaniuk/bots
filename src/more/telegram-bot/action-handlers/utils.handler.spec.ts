import { UtilsHandler } from './utils.handler';
import { AppContext } from '../../../shared/interfaces';
import { createMockContext } from '../../../../test/context.mock';


describe('UtilsHandler', () => {
  let handler: UtilsHandler;

  let ctx: AppContext;

  beforeEach(() => {
    handler = new UtilsHandler();

    ctx = createMockContext();
  });

  describe('pong', () => {
    it('should reply with pong message', async () => {
      await handler.pong(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('other.pong');
    });
  });

  describe('getHelp', () => {
    it('should reply with game rules', async () => {
      await handler.getHelp(ctx);

      expect(ctx.replyWithMarkdown).toHaveBeenCalledWith('other.rules');
    });
  });
});
