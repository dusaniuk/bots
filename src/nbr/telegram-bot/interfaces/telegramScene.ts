import { BaseScene, Stage } from 'telegraf';
import { injectable } from 'inversify';

import { AppContext } from '../../../shared/interfaces';

@injectable()
export abstract class TelegramScene {
  protected scene: BaseScene<AppContext>;

  protected constructor(sceneId) {
    this.scene = new BaseScene<AppContext>(sceneId);
  }

  public useScene = (stage: Stage<AppContext>): void => {
    stage.register(this.scene);

    this.attachHookListeners();
  };

  protected abstract attachHookListeners(): void;
}
