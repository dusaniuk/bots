import { BaseScene, Stage } from 'telegraf';
import { inject, injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';
import { TYPES } from '../../types';

import { ISceneFactory } from './scene-factory';

@injectable()
export abstract class TelegramScene {
  @inject(TYPES.SCENE_FACTORY) public sceneFactory: ISceneFactory;

  protected scene: BaseScene<AppContext>;

  protected constructor(protected sceneId: string) {}

  public useScene = (stage: Stage<AppContext>): void => {
    this.scene = this.sceneFactory.createScene(this.sceneId);
    stage.register(this.scene);

    this.attachHookListeners();
  };

  protected abstract attachHookListeners(): void;
}
