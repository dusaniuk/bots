export class CatchHimselfError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CatchHimselfError';
  }
}
