import { Actions, Activity } from './enums';

export const ACTIVITIES = {
  [Activity.Run]: 'Біг 🏃‍',
  [Activity.Swim]: 'Плавання 🏊‍',
  [Activity.Stretch]: 'Стрейчінг 🙆',
  [Activity.Climb]: 'Скалолазання 🧗',
  [Activity.Sketch]: 'Скетчінг 🎨',
};

export const ACTIONS = {
  [Actions.Next]: 'Далі ➡',
  [Actions.Approve]: 'Підтвердити ✅',
  [Actions.Restart]: 'Повторити вибір 🔁',
};
