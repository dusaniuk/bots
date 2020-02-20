export class NotInGameError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotInGameError';
  }
}
