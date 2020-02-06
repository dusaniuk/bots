import * as faker from 'faker';

import { AppContext } from '../../shared/interfaces';

import { createBaseSceneMock, getSceneState, TestableSceneState } from '../../../test/baseScene.mock';
import { ActivitiesStore, MessageStore, UsersStore } from '../interfaces';
import { createMockContext } from '../../../test/context.mock';
import { Actions, Activity } from '../constants/enums';

import { AnnounceScene, AnnounceState } from './announce.scene';

jest.mock('../keyboards');
jest.mock('../utils/user.utils');
jest.mock('../utils/activities.utils');

describe('AnnounceScene', () => {
  let instance: AnnounceScene;

  let activitiesStore: ActivitiesStore;
  let messageStore: MessageStore;
  let usersStore: UsersStore;

  let scene: TestableSceneState;
  let ctx: AppContext;

  beforeEach(() => {
    jest.clearAllMocks();

    const baseScene = createBaseSceneMock();
    activitiesStore = {
      getAll: jest.fn().mockResolvedValue({}),
    } as any;
    messageStore = {} as any;
    usersStore = {
      getUser: jest.fn().mockReturnValue({}),
    } as any;

    instance = new AnnounceScene(baseScene, activitiesStore, messageStore, usersStore);

    scene = getSceneState(instance.scene);

    ctx = createMockContext();
    ctx.scene.state = {
      preferences: {},
      isListeningForMessage: false,
      isListeningForTopic: false,
      message: '',
      topic: '',
    };
  });

  describe('ctor', () => {
    it('should attach hook listeners', () => {
      expect(instance.scene.enter).toHaveBeenCalledTimes(1);
      expect(instance.scene.on).toHaveBeenCalledTimes(1);
      expect(instance.scene.action).toHaveBeenCalledTimes(5);
      expect(instance.scene.hears).toHaveBeenCalledTimes(1);
    });
  });

  describe('onEnterScene', () => {
    beforeEach(() => {
      ctx.from = { ...ctx.from, id: 1 };
    });

    it('should drop state', async () => {
      ctx.scene.state = { foo: 'bar' };

      await scene.onEnter(ctx);

      expect(ctx.scene.state).toEqual({
        preferences: {},
        isListeningForMessage: false,
        isListeningForTopic: false,
        message: '',
        topic: '',
      });
    });

    it('should request user by from id', async () => {
      await scene.onEnter(ctx);

      expect(usersStore.getUser).toHaveBeenCalledWith(`${ctx.from.id}`);
    });

    it('should reply that announce is prohibited and leave state', async () => {
      usersStore.getUser = jest.fn().mockReturnValue({ allowedToAnnounce: false });

      await scene.onEnter(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('announce.prohibited');
      expect(ctx.scene.leave).toHaveBeenCalledTimes(1);
    });

    it('should reply with announce.intro', async () => {
      usersStore.getUser = jest.fn().mockReturnValue({ allowedToAnnounce: true });

      await scene.onEnter(ctx);

      expect(ctx.replyWithMarkdown).toHaveBeenCalledWith('announce.intro');
    });

    it('should reply with announce.chooseActivities', async () => {
      usersStore.getUser = jest.fn().mockReturnValue({ allowedToAnnounce: true });

      await scene.onEnter(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('announce.chooseActivities', expect.anything());
    });
  });

  describe('onSelectActivity', () => {
    it('should toggle activity to true', async () => {
      ctx.callbackQuery.data = Activity.Climb;

      await scene.actions.get('/^.*$/')(ctx);

      expect((ctx.scene.state as any).preferences[Activity.Climb]).toBeTruthy();
    });

    it('should toggle activity to false', async () => {
      ctx.scene.state = { preferences: { [Activity.Climb]: true } };
      ctx.callbackQuery.data = Activity.Climb;

      await scene.actions.get('/^.*$/')(ctx);

      expect((ctx.scene.state as any).preferences[Activity.Climb]).toBeFalsy();
    });

    it('should edit message text', async () => {
      ctx.scene.state = { preferences: {} };

      await scene.actions.get('/^.*$/')(ctx);

      expect(ctx.editMessageText).toHaveBeenCalledWith('announce.chooseActivities', expect.anything());
    });
  });

  describe('onSelectAll', () => {
    it('should toggle all activities to true', async () => {
      await scene.actions.get(Activity.All)(ctx);

      const state = ctx.scene.state as AnnounceState;
      expect(state.preferences[Activity.All]).toBeTruthy();
      expect(state.preferences[Activity.Run]).toBeTruthy();
      expect(state.preferences[Activity.OCR]).toBeTruthy();
    });
  });

  describe('onNext', () => {
    it('should delete message', async () => {
      await scene.actions.get(Actions.Next)(ctx);

      expect(ctx.deleteMessage).toHaveBeenCalled();
    });

    it('should reply with announce.requestTopic', async () => {
      await scene.actions.get(Actions.Next)(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('announce.requestTopic');
    });

    it('should switch isListeningForTopic to true', async () => {
      await scene.actions.get(Actions.Next)(ctx);

      expect((ctx.scene.state as any).isListeningForTopic).toBeTruthy();
    });
  });

  describe('onMessage', () => {
    it("shouldn't do anything if topic & message aren't required", async () => {
      ctx.scene.state = {
        ...ctx.scene.state,
        isListeningForTopic: false,
        isListeningForMessage: false,
      };

      await scene.on.get('message')(ctx);

      expect(ctx.reply).not.toHaveBeenCalled();
      expect(ctx.replyWithMarkdown).not.toHaveBeenCalled();
    });

    it('should read topic from ctx and reply with announce.requestMessage', async () => {
      ctx.scene.state = {
        ...ctx.scene.state,
        isListeningForTopic: true,
      };
      ctx.message = {
        ...ctx.message,
        text: faker.lorem.text(),
      };

      await scene.on.get('message')(ctx);

      const { topic, isListeningForTopic, isListeningForMessage } = ctx.scene.state as AnnounceState;

      expect(topic).toEqual(ctx.message.text);
      expect(isListeningForTopic).toBeFalsy();
      expect(isListeningForMessage).toBeTruthy();
      expect(ctx.reply).toHaveBeenCalledWith('announce.requestMessage');
    });

    it('should read message from ctx and generate full message text', async () => {
      ctx.scene.state = {
        ...ctx.scene.state,
        topic: faker.lorem.text(),
        isListeningForMessage: true,
      };
      ctx.message = {
        ...ctx.message,
        text: faker.lorem.text(),
      };

      await scene.on.get('message')(ctx);

      const state = ctx.scene.state as AnnounceState;

      expect(state.message).toEqual(ctx.message.text);
      expect(state.isListeningForTopic).toBeFalsy();
      expect(state.isListeningForMessage).toBeFalsy();
      expect(ctx.i18n.t).toHaveBeenCalledWith('announce.message', {
        user: expect.any(String),
        activities: expect.any(String),
        message: state.message,
        topic: state.topic,
      });
    });

    it('should handle error in case of invalid markdown and leave scene', async () => {
      ctx.scene.state = {
        ...ctx.scene.state,
        topic: faker.lorem.text(),
        isListeningForMessage: true,
      };
      ctx.message = {
        ...ctx.message,
        text: faker.lorem.text(),
      };

      ctx.replyWithMarkdown = jest
        .fn()
        .mockRejectedValueOnce({})
        .mockResolvedValue({});

      try {
        await scene.on.get('message')(ctx);
      } catch (e) {
        expect(ctx.replyWithMarkdown).toHaveBeenCalledWith('error.invalidMarkdown');
        expect(ctx.scene.leave).toHaveBeenCalled();
      }
    });
  });

  describe('onRestart', () => {
    it('should delete message', async () => {
      await scene.actions.get(Actions.Restart)(ctx);

      expect(ctx.deleteMessage).toHaveBeenCalled();
    });

    it('should reenter scene', async () => {
      await scene.actions.get(Actions.Restart)(ctx);

      expect(ctx.scene.reenter).toHaveBeenCalled();
    });
  });
});
