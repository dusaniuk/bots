import { AnnounceScene } from './announce.scene';

import { ActivitiesService } from '../services/activities.service';
import { MessagingService } from '../services/messaging.service';
import { UsersService } from '../services/users.service';

import { AppContext } from '../../shared/models/appContext';

import { createBaseSceneMock, getSceneState, TestableSceneState } from '../../../test/baseScene.mock';
import { createMockContext } from '../../../test/context.mock';

describe('AnnounceScene', () => {
  let instance: AnnounceScene;
  let activitiesService: ActivitiesService;
  let messagingService: MessagingService;
  let usersService: UsersService;

  let scene: TestableSceneState;
  let ctx: AppContext;

  beforeEach(() => {
    jest.clearAllMocks();

    const baseScene = createBaseSceneMock();
    activitiesService = {} as any;
    messagingService = {} as any;
    usersService = {} as any;

    instance = new AnnounceScene(baseScene, activitiesService, messagingService, usersService);

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
});
