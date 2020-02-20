export class NoCatchError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NoCatchError';
  }
}
