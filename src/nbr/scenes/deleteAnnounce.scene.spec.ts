import { DeleteAnnounceScene, DeleteAnnounceState } from './deleteAnnounce.scene';
import { createBaseSceneMock, getSceneState, TestableSceneState } from '../../../test/baseScene.mock';
import { MessagingService } from '../services/messaging.service';
import { UsersService } from '../services/users.service';
import { AppContext } from '../../shared/models/appContext';
import { createMockContext } from '../../../test/context.mock';

jest.mock('../keyboards', () => ({
  getDeleteMessagesKeyboard: jest.fn().mockReturnValue({}),
  getApproveKeyboard: jest.fn().mockReturnValue({}),
}));

describe('DeleteAnnounceScene', () => {
  let instance: DeleteAnnounceScene;

  let messagingService: MessagingService;
  let usersService: UsersService;

  let scene: TestableSceneState;
  let ctx: AppContext;

  beforeEach(() => {
    jest.clearAllMocks();

    const baseScene = createBaseSceneMock();
    messagingService = {
      getLastMessages: jest.fn().mockResolvedValue([]),
    } as any;
    usersService = {
      getUser: jest.fn().mockResolvedValue({}),
    } as any;

    instance = new DeleteAnnounceScene(baseScene, messagingService, usersService);

    scene = getSceneState(instance.scene);

    ctx = createMockContext();
    ctx.scene.state = {
      messages: [],
      selectedMessage: {},
    };
  });

  describe('ctor', () => {
    it('should attach hook listeners', () => {
      expect(instance.scene.enter).toHaveBeenCalledTimes(1);
      expect(instance.scene.action).toHaveBeenCalledTimes(3);
      expect(instance.scene.hears).toHaveBeenCalledTimes(1);
    });
  });

  describe('onEnterState', () => {
    beforeEach(() => {
      ctx.from = { ...ctx.from, id: 1 };
    });

    it('should drop state', async () => {
      ctx.scene.state = { foo: 'bar' };

      await scene.onEnter(ctx);

      expect(ctx.scene.state).toEqual({
        messages: [],
        selectedMessage: {},
      });
    });

    it('should get user', async () => {
      await scene.onEnter(ctx);

      expect(usersService.getUser).toHaveBeenCalledWith(`${ctx.from.id}`);
    });

    it('should reply with deleteAnnounce.prohibited and leave state', async () => {
      usersService.getUser = jest.fn().mockReturnValue({ allowedToAnnounce: false });

      await scene.onEnter(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('deleteAnnounce.prohibited');
      expect(ctx.scene.leave).toHaveBeenCalled();
    });

    it('should get last messages', async () => {
      usersService.getUser = jest.fn().mockReturnValue({ allowedToAnnounce: true });

      await scene.onEnter(ctx);

      expect(messagingService.getLastMessages).toHaveBeenCalled();
    });

    it('should reply with deleteAnnounce.noMessages and leave scene', async () => {
      usersService.getUser = jest.fn().mockReturnValue({ allowedToAnnounce: true });
      messagingService.getLastMessages = jest.fn().mockResolvedValue([]);

      await scene.onEnter(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('deleteAnnounce.noMessages');
      expect(ctx.scene.leave).toHaveBeenCalled();
    });

    it('should store last messages in state', async () => {
      const messages: any[] = ['one', 'two'];

      usersService.getUser = jest.fn().mockReturnValue({ allowedToAnnounce: true });
      messagingService.getLastMessages = jest.fn().mockResolvedValue(messages);

      await scene.onEnter(ctx);

      expect((ctx.scene.state as DeleteAnnounceState).messages).toEqual(messages);
    });

    it('should reply with deleteAnnounce.intro2 if there are some messages', async () => {
      usersService.getUser = jest.fn().mockReturnValue({ allowedToAnnounce: true });
      messagingService.getLastMessages = jest.fn().mockResolvedValue(['one', 'two']);

      await scene.onEnter(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('deleteAnnounce.intro2', expect.anything());
    });
  });
});
