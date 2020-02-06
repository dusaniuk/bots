export enum Activity {
  Run = 'run',
  OCR = 'ocr',
  Swim = 'swim',
  Stretch = 'stretch',
  Climb = 'climb',
  Cycling = 'cycling',
  All = 'all',
}

export const enum Actions {
  Next = 'next',
  Approve = 'approve',
  Restart = 'restart',
}

export const enum Scene {
  Activities = 'ACTIVITIES.SCENE',
  Announce = 'ANNOUNCE.SCENE',
  DeleteAnnounce = 'DELETE_ANNOUNCE.SCENE',
}
