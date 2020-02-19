import { Mention, User } from '../../interfaces';

export interface CatchSummary {
  victims: User[];
  unverifiedMentions?: Mention[];
  admin: User;
  catchId: string;
}
