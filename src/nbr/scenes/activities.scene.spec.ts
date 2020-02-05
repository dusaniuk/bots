import { ActivitiesScene } from './activities.scene';
import { Actions, Activity } from '../constants/enums';
import { AppContext } from '../../shared/interfaces/appContext';
import { ActivitiesService } from '../services/activities.service';
import { stringifySelectedActivities } from '../utils/activities.utils';

import { createBaseSceneMock, getSceneState, TestableSceneState } from '../../../test/baseScene.mock';
import { createMockContext } from '../../../test/context.mock';

jest.mock('../utils/activities.utils');
jest.mock('../keyboards');

describe('ActivitiesScene', () => {
  let instance: ActivitiesScene;
  let activitiesService: ActivitiesService;

  let scene: TestableSceneState;
  let ctx: AppContext;

  beforeEach(() => {
    jest.clearAllMocks();

    const baseScene = createBaseSceneMock();
    activitiesService = {
      save: jest.fn(),
    } as any;

    instance = new ActivitiesScene(baseScene, activitiesService);

    scene = getSceneState(instance.scene);

    ctx = createMockContext();
    ctx.scene.state = { preferences: {} };
  });

  describe('ctor', () => {
    it('should attach hook listeners', () => {
      expect(instance.scene.enter).toHaveBeenCalledTimes(1);
      expect(instance.scene.action).toHaveBeenCalledTimes(5);
      expect(instance.scene.hears).toHaveBeenCalledTimes(1);
    });
  });

  describe('onEnterScene', () => {
    it('should drop state', async () => {
      ctx.scene.state = { preferences: { foobar: 'data' } };

      await scene.onEnter(ctx, () => {});

      expect(ctx.scene.state).toEqual({
        preferences: {},
      });
    });

    it('should reply with intro message', async () => {
      await scene.onEnter(ctx, () => {});

      expect(ctx.reply).toHaveBeenCalledWith('activities.intro', expect.anything());
    });
  });

  describe('onSelectActivity', () => {
    it('should toggle activity to true', async () => {
      ctx.callbackQuery.data = Activity.Run;

      await scene.actions.get('/^.*$/')(ctx);

      expect((ctx.scene.state as any).preferences[Activity.Run]).toBeTruthy();
    });

    it('should toggle activity to false', async () => {
      ctx.scene.state = { preferences: { [Activity.Run]: true } };
      ctx.callbackQuery.data = Activity.Run;

      await scene.actions.get('/^.*$/')(ctx);

      expect((ctx.scene.state as any).preferences[Activity.Run]).toBeFalsy();
    });

    it('should edit message text', async () => {
      ctx.scene.state = { preferences: {} };

      await scene.actions.get('/^.*$/')(ctx);

      expect(ctx.editMessageText).toHaveBeenCalledWith('activities.intro', expect.anything());
    });
  });

  describe('onSelectAll', () => {
    it('should toggle all activity to true', async () => {
      await scene.actions.get(Activity.All)(ctx);

      expect((ctx.scene.state as any).preferences[Activity.All]).toBeTruthy();
    });
  });

  describe('onNext', () => {
    it('should delete message', async () => {
      await scene.actions.get(Actions.Next)(ctx);

      expect(ctx.deleteMessage).toHaveBeenCalled();
    });

    it('should stringify selected activities', async () => {
      await scene.actions.get(Actions.Next)(ctx);

      expect(stringifySelectedActivities).toHaveBeenCalledWith(ctx, (ctx.scene.state as any).preferences);
    });

    it('should reply with markdown', async () => {
      await scene.actions.get(Actions.Next)(ctx);

      expect(ctx.replyWithMarkdown).toHaveBeenCalledWith(expect.any(String), expect.anything());
    });
  });

  describe('onRestart', () => {
    it('should delete message', async () => {
      await scene.actions.get(Actions.Restart)(ctx);

      expect(ctx.deleteMessage).toHaveBeenCalled();
    });

    it('should reenter state', async () => {
      await scene.actions.get(Actions.Restart)(ctx);

      expect(ctx.scene.reenter).toHaveBeenCalled();
    });
  });

  describe('onApprove', () => {
    beforeEach(() => {
      ctx.from = { ...ctx.from, id: 1 };
    });

    it('should delete message', async () => {
      await scene.actions.get(Actions.Approve)(ctx);

      expect(ctx.deleteMessage).toHaveBeenCalled();
    });

    it('should get selected message', async () => {
      await scene.actions.get(Actions.Approve)(ctx);

      expect(ctx.i18n.t).toHaveBeenCalledWith('activities.selectedSummary', expect.any(Object));
    });

    it('should stringify selected activities', async () => {
      await scene.actions.get(Actions.Approve)(ctx);

      expect(stringifySelectedActivities).toHaveBeenCalledWith(ctx, (ctx.scene.state as any).preferences);
    });

    it('should reply with markdown', async () => {
      await scene.actions.get(Actions.Approve)(ctx);

      expect(ctx.replyWithMarkdown).toHaveBeenCalled();
    });

    it('should reply with saving activities message', async () => {
      await scene.actions.get(Actions.Approve)(ctx);

      expect(ctx.i18n.t).toHaveBeenCalledWith('activities.saving');
      expect(ctx.reply).toHaveBeenCalledWith('activities.saving');
    });

    it('should save activities', async () => {
      await scene.actions.get(Actions.Approve)(ctx);

      expect(activitiesService.save).toHaveBeenCalledWith(ctx.from.id, expect.anything());
    });

    it('should deleteMessage', async () => {
      await scene.actions.get(Actions.Approve)(ctx);

      expect(ctx.telegram.deleteMessage).toHaveBeenCalled();
    });

    it('should reply with saved activities message', async () => {
      await scene.actions.get(Actions.Approve)(ctx);

      expect(ctx.i18n.t).toHaveBeenCalledWith('activities.saved');
      expect(ctx.reply).toHaveBeenCalledWith('activities.saved');
    });

    it('should leave scene', async () => {
      await scene.actions.get(Actions.Approve)(ctx);

      expect(ctx.scene.leave).toHaveBeenCalled();
    });
  });
});
