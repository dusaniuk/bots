import { AppContext } from '../models/appContext';
import { getTitle } from './title.utils';

export const getNormalizedActivities = (ctx: AppContext, activities: string[] = []): string => {
  return activities.reduce((msg, activity) => {
    const activityTitle = getTitle(ctx, activity);
    return msg === '' ? activityTitle : `${msg}, ${activityTitle}`;
  }, '');
};
