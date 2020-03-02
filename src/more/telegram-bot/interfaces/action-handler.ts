import { AppContext } from '../../../shared/interfaces';

export interface ActionHandler {
  execute(ctx: AppContext): Promise<any>;
}
