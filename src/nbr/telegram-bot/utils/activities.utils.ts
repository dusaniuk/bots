import { AppContext } from '../../../shared/interfaces/app-context';
import { getTitle } from './title.utils';
import { Activity } from '../constants/enums';
import { ActivitiesPreferences } from '../../core/interfaces/activities';

export const extractSelectedActivities = (preferences: ActivitiesPreferences): string[] => {
  const selectedActivities: string[] = [];

  Object.keys(preferences).forEach((key: string) => {
    if (preferences[key]) {
      selectedActivities.push(key);
    }
  });

  return selectedActivities;
};

export const stringifySelectedActivities = (ctx: AppContext, preferences: ActivitiesPreferences = {}): string => {
  const activities = extractSelectedActivities(preferences);

  if (activities.includes(Activity.All)) {
    return getTitle(ctx, Activity.All);
  }

  return activities.reduce((msg, activity) => {
    const activityTitle = getTitle(ctx, activity);
    return msg === '' ? activityTitle : `${msg}, ${activityTitle}`;
  }, '');
};

export const getActivitiesKeys = (): string[] => {
  return Object.keys(Activity).map(k => Activity[k]);
};
