import { Actions } from '../constants/actions';

export interface AdminDecision {
  action: Actions;
  catchId: string;
  chatId: number;
}
