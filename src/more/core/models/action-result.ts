export class ActionResult<T = {}> {
  public ok = true;
  public payload: T;

  public get failed(): boolean {
    return !this.ok;
  }

  constructor(public error?: Error) {
    if (error) {
      this.ok = false;
    }
  }

  static success<T>(payload?: T): ActionResult<T> {
    const result: ActionResult<T> = new ActionResult();
    result.payload = payload;

    return result;
  }
}
