import { Activity } from '../../telegram-bot/constants/enums';

export interface ActivitiesData {
  [Activity.Run]: number[];
  [Activity.OCR]: number[];
  [Activity.Swim]: number[];
  [Activity.Stretch]: number[];
  [Activity.Climb]: number[];
  [Activity.Cycling]: number[];
  [Activity.All]: number[];
}

export interface ActivitiesPreferences {
  [key: string]: boolean;
}
