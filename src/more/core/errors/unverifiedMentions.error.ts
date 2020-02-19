import { Mention } from '../../interfaces';

export class UnverifiedMentionsError extends Error {
  constructor(message, public unverifiedMentions: Mention[]) {
    super(message);
    this.name = 'UnverifiedMentionsError';
  }
}
