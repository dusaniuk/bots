import { ACTIVITIES } from '../constants/titles';

export const getNormalizedActivities = (activities: string[] = []): string => {
  return activities.reduce((msg, activity) => {
    const normalizedActivity = ACTIVITIES[activity].split(' ')[0];
    return msg === '' ? normalizedActivity : `${msg}, ${normalizedActivity}`;
  }, '');
};
