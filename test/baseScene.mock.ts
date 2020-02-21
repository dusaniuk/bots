import { BaseScene, HearsTriggers, Middleware } from 'telegraf';
import { UpdateType } from 'telegraf/typings/telegram-types';

import { AppContext } from '../src/shared/interfaces';
import { ISceneFactory } from '../src/nbr/telegram-bot/interfaces/scene-factory';

export interface TestableSceneState {
  onEnter?: Middleware<AppContext>;
  actions: Map<HearsTriggers, Middleware<AppContext>>;
  on: Map<UpdateType, Middleware<AppContext>>;
}

export const createMockSceneFactory = (): ISceneFactory => {
  return {
    createScene: (): BaseScene<AppContext> => {
      const state: TestableSceneState = {
        actions: new Map<HearsTriggers, Middleware<AppContext>>(),
        on: new Map<UpdateType, Middleware<AppContext>>(),
      };

      return ({
        enter: jest.fn().mockImplementation((...middleware: Middleware<AppContext>[]) => {
          state.onEnter = middleware[0];
        }),
        action: jest.fn().mockImplementation((trigger: HearsTriggers, middleware: Middleware<AppContext>) => {
          state.actions.set(trigger.toString(), middleware);
        }),
        on: jest.fn().mockImplementation((updateType: UpdateType, middleware: Middleware<AppContext>) => {
          state.on.set(updateType, middleware);
        }),
        hears: jest.fn(),
        __state__: state,
      } as any) as BaseScene<AppContext>;
    },
  };
};

export const getSceneState = (scene: BaseScene<AppContext>): TestableSceneState => {
  return scene['__state__'] as TestableSceneState;
};
