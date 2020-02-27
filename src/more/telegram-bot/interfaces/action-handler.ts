import { AppContext } from '../../../shared/interfaces';

export interface ActionHandler {
  handleAction(ctx: AppContext): Promise<any>;
}
