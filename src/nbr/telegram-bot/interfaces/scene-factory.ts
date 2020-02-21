import { BaseScene } from 'telegraf';
import { AppContext } from '../../../shared/interfaces';

export interface ISceneFactory {
  createScene(sceneId): BaseScene<AppContext>;
}
