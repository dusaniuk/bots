import { injectable } from 'inversify';
import { BaseScene } from 'telegraf';
import { AppContext } from '../../../shared/interfaces';
import { ISceneFactory } from '../interfaces/scene-factory';

@injectable()
export class SceneFactory implements ISceneFactory {
  createScene = (sceneId: string): BaseScene<AppContext> => {
    return new BaseScene<AppContext>(sceneId);
  };
}
