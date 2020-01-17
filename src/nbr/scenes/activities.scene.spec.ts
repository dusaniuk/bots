import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { BaseScene, HearsTriggers, Middleware } from 'telegraf';
import { firestore } from 'firebase-admin';

import { ActivitiesScene } from './activities.scene';
import { ActivitiesService } from '../services/activities.service';
import { AppContext } from '../../shared/models/appContext';
import { createMockContext } from '../../../test/utils';
import { Actions, Activity } from '../constants/enums';
import { stringifySelectedActivities } from '../utils/activities.utils';

export interface SceneTestState {
  onEnter?: Middleware<AppContext>;
  actions: Map<HearsTriggers, Middleware<AppContext>>;
}

jest.mock('telegraf');
jest.mock('telegraf', () => ({
  BaseScene: jest.fn().mockImplementation(() => {
    const state: SceneTestState = {
      actions: new Map<HearsTriggers, Middleware<AppContext>>(),
    };

    return {
      enter: jest.fn().mockImplementation((...middleware: Middleware<AppContext>[]) => {
        state.onEnter = middleware[0];
      }),
      action: jest.fn().mockImplementation((trigger: HearsTriggers, middleware: Middleware<AppContext>) => {
        state.actions.set(trigger.toString(), middleware);
      }),
      hears: jest.fn(),
      __state__: state,
    };
  }),
  Stage: {
    leave: jest.fn(),
  },
}));

jest.mock('../services/activities.service', () => ({
  ActivitiesService: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
  })),
}));
jest.mock('../utils/activities.utils');
jest.mock('../keyboards', () => ({
  getActivitiesKeyboard: jest.fn().mockReturnValue({} as ExtraReplyMessage),
  getApproveKeyboard: jest.fn().mockReturnValue({} as ExtraReplyMessage),
}));

describe('ActivitiesScene', () => {
  let instance: ActivitiesScene;
  let ctx: AppContext;

  let dbMock: firestore.Firestore;

  beforeEach(() => {
    jest.clearAllMocks();

    dbMock = jest.fn() as any;

    instance = new ActivitiesScene(dbMock);

    ctx = createMockContext();
    ctx.scene.state = { preferences: {} };
  });

  const getSceneState = (): SceneTestState => {
    return instance.scene['__state__'] as SceneTestState;
  };

  describe('ctor', () => {
    it('should initialize activities service', () => {
      expect(ActivitiesService).toHaveBeenCalledWith(dbMock);
    });

    it('should create base scene with unique id', () => {
      expect(BaseScene).toHaveBeenCalledWith(ActivitiesScene.ID);
    });

    it('should attach hook listeners', () => {
      expect(instance.scene.enter).toHaveBeenCalledTimes(1);
      expect(instance.scene.action).toHaveBeenCalledTimes(5);
      expect(instance.scene.hears).toHaveBeenCalledTimes(1);
    });
  });

  describe('onEnterScene', () => {
    it('should drop state', async () => {
      ctx.scene.state = { preferences: { foobar: 'data' } };

      await getSceneState().onEnter(ctx, () => {});

      expect(ctx.scene.state).toEqual({
        preferences: {},
      });
    });

    it('should reply with intro message', async () => {
      await getSceneState().onEnter(ctx, () => {});

      expect(ctx.reply).toHaveBeenCalledWith('activities.intro', expect.anything());
    });
  });

  describe('onSelectActivity', () => {
    it('should toggle activity to true', async () => {
      ctx.callbackQuery.data = Activity.Run;

      await getSceneState().actions.get('/^.*$/')(ctx);

      expect((ctx.scene.state as any).preferences[Activity.Run]).toBeTruthy();
    });

    it('should toggle activity to false', async () => {
      ctx.scene.state = { preferences: { [Activity.Run]: true } };
      ctx.callbackQuery.data = Activity.Run;

      await getSceneState().actions.get('/^.*$/')(ctx);

      expect((ctx.scene.state as any).preferences[Activity.Run]).toBeFalsy();
    });

    it('should edit message text', async () => {
      ctx.scene.state = { preferences: {} };

      await getSceneState().actions.get('/^.*$/')(ctx);

      expect(ctx.editMessageText).toHaveBeenCalledWith('activities.intro', expect.anything());
    });
  });

  describe('onSelectAll', () => {
    it('should toggle all activity to true', async () => {
      await getSceneState().actions.get(Activity.All)(ctx);

      expect((ctx.scene.state as any).preferences[Activity.All]).toBeTruthy();
    });
  });

  describe('onNext', () => {
    it('should delete message', async () => {
      await getSceneState().actions.get(Actions.Next)(ctx);

      expect(ctx.deleteMessage).toHaveBeenCalled();
    });

    it('should stringify selected activities', async () => {
      await getSceneState().actions.get(Actions.Next)(ctx);

      expect(stringifySelectedActivities).toHaveBeenCalledWith(ctx, (ctx.scene.state as any).preferences);
    });

    it('should reply with markdown', async () => {
      await getSceneState().actions.get(Actions.Next)(ctx);

      expect(ctx.replyWithMarkdown).toHaveBeenCalledWith(expect.any(String), expect.anything());
    });
  });

  describe('onRestart', () => {
    it('should delete message', async () => {
      await getSceneState().actions.get(Actions.Restart)(ctx);

      expect(ctx.deleteMessage).toHaveBeenCalled();
    });

    it('should reenter state', async () => {
      await getSceneState().actions.get(Actions.Restart)(ctx);

      expect(ctx.scene.reenter).toHaveBeenCalled();
    });
  });

  describe('onApprove', () => {
    beforeEach(() => {
      ctx.from = { ...ctx.from, id: 1 };
    });

    it('should delete message', async () => {
      await getSceneState().actions.get(Actions.Approve)(ctx);

      expect(ctx.deleteMessage).toHaveBeenCalled();
    });

    it('should get selected message', async () => {
      await getSceneState().actions.get(Actions.Approve)(ctx);

      expect(ctx.i18n.t).toHaveBeenCalledWith('activities.selectedSummary', expect.any(Object));
    });

    it('should stringify selected activities', async () => {
      await getSceneState().actions.get(Actions.Approve)(ctx);

      expect(stringifySelectedActivities).toHaveBeenCalledWith(ctx, (ctx.scene.state as any).preferences);
    });

    it('should reply with markdown', async () => {
      await getSceneState().actions.get(Actions.Approve)(ctx);

      expect(ctx.replyWithMarkdown).toHaveBeenCalled();
    });

    it('should reply with saving activities message', async () => {
      await getSceneState().actions.get(Actions.Approve)(ctx);

      expect(ctx.i18n.t).toHaveBeenCalledWith('activities.saving');
      expect(ctx.reply).toHaveBeenCalledWith('activities.saving');
    });

    it('should deleteMessage', async () => {
      await getSceneState().actions.get(Actions.Approve)(ctx);

      expect(ctx.telegram.deleteMessage).toHaveBeenCalled();
    });

    it('should reply with saved activities message', async () => {
      await getSceneState().actions.get(Actions.Approve)(ctx);

      expect(ctx.i18n.t).toHaveBeenCalledWith('activities.saved');
      expect(ctx.reply).toHaveBeenCalledWith('activities.saved');
    });

    it('should leave scene', async () => {
      await getSceneState().actions.get(Actions.Approve)(ctx);

      expect(ctx.scene.leave).toHaveBeenCalled();
    });
  });
});
