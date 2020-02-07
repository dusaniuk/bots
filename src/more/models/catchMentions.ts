import { Mention, User } from '../interfaces';

export class CatchMentions {
  public get hasMentions(): boolean {
    return (this.victims.length + this.unverifiedMentions.length) > 0;
  }

  public get isMentionedHimself(): boolean {
    return this.victims.some((user: User) => user.id === this.hunter.id);
  }

  public get haveUnverifiedMentions(): boolean {
    return this.unverifiedMentions.length > 0;
  }

  public get haveVictims(): boolean {
    return this.victims.length > 0;
  }

  constructor(
    public admin: User,
    public hunter: User,
    public victims: User[],
    public unverifiedMentions: Mention[],
  ) {}
}
