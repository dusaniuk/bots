import { BaseScene, HearsTriggers, Middleware } from 'telegraf';
import { AppContext } from '../src/shared/models/appContext';

export interface TestableSceneState {
  onEnter?: Middleware<AppContext>;
  actions: Map<HearsTriggers, Middleware<AppContext>>;
}

export const createBaseSceneMock = (): BaseScene<AppContext> => {
  const state: TestableSceneState = {
    actions: new Map<HearsTriggers, Middleware<AppContext>>(),
  };

  return ({
    enter: jest.fn().mockImplementation((...middleware: Middleware<AppContext>[]) => {
      state.onEnter = middleware[0];
    }),
    action: jest.fn().mockImplementation((trigger: HearsTriggers, middleware: Middleware<AppContext>) => {
      state.actions.set(trigger.toString(), middleware);
    }),
    on: jest.fn(),
    hears: jest.fn(),
    __state__: state,
  } as any) as BaseScene<AppContext>;
};

export const getSceneState = (scene: BaseScene<AppContext>): TestableSceneState => {
  return scene['__state__'] as TestableSceneState;
};
