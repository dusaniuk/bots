import { Mention } from '../interfaces/catch';
import { User } from '../interfaces/user';

export class CatchMentions {
  public get hasAnyMentions(): boolean {
    return (this.victims.length + (this.unverifiedMentions?.length ?? 0)) > 0;
  }

  public get hasUnverifiedMentions(): boolean {
    return (this.unverifiedMentions?.length ?? 0) > 0;
  }

  public get haveVictims(): boolean {
    return this.victims.length > 0;
  }

  constructor(
    public victims: User[],
    public unverifiedMentions?: Mention[],
  ) {}
}
