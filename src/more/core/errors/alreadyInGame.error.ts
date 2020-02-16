export class AlreadyInGameError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AlreadyInGameError';
  }
}
