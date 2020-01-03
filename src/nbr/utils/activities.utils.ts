import { AppContext } from '../../shared/models/appContext';
import { getTitle } from './title.utils';
import { Activity } from '../constants/enums';

export const getNormalizedActivities = (ctx: AppContext, activities: string[] = []): string => {
  if (activities.includes(Activity.All)) {
    return getTitle(ctx, Activity.All);
  }

  return activities.reduce((msg, activity) => {
    const activityTitle = getTitle(ctx, activity);
    return msg === '' ? activityTitle : `${msg}, ${activityTitle}`;
  }, '');
};
