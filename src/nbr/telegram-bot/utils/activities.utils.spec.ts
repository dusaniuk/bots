import { Activity } from '../constants/enums';
import { extractSelectedActivities, getActivitiesKeys, stringifySelectedActivities } from './activities.utils';
import { AppContext } from '../../../shared/interfaces/app-context';
import { ActivitiesPreferences } from '../../core/interfaces/activities';

jest.mock('./title.utils', () => ({
  getTitle: jest.fn().mockImplementation((ctx, activity) => activity),
}));

describe('activities.utils', () => {
  describe('extractSelectedActivities', () => {
    let preferences: ActivitiesPreferences;

    beforeEach(() => {
      preferences = {};
    });

    it('should return selected activity', () => {
      preferences = {
        [Activity.Cycling]: true,
      };

      const result = extractSelectedActivities(preferences);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(Activity.Cycling);
    });

    it('should return only selected activities', () => {
      preferences = {
        [Activity.Cycling]: true,
        [Activity.Run]: false,
        [Activity.OCR]: true,
      };

      const result = extractSelectedActivities(preferences);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(Activity.Cycling);
      expect(result[1]).toEqual(Activity.OCR);
    });
  });

  describe('stringifySelectedActivities', () => {
    let ctx: AppContext;
    let preferences: ActivitiesPreferences;

    beforeEach(() => {
      ctx = {} as AppContext;
      preferences = {};
    });

    it('should return list of activities', () => {
      preferences = {
        [Activity.Cycling]: true,
        [Activity.Run]: true,
        [Activity.Climb]: true,
      };

      const result = stringifySelectedActivities(ctx, preferences);

      expect(result).toEqual(`${Activity.Cycling}, ${Activity.Run}, ${Activity.Climb}`);
    });

    it('should return only All activity if it is included in activities array', () => {
      preferences = {
        [Activity.Cycling]: true,
        [Activity.Run]: true,
        [Activity.All]: true,
      };

      const result = stringifySelectedActivities(ctx, preferences);

      expect(result).toEqual(`${Activity.All}`);
    });

    it("should return only one title name if there's only one item in activities", () => {
      preferences = {
        [Activity.Cycling]: true,
      };

      const result = stringifySelectedActivities(ctx, preferences);

      expect(result).toEqual(`${Activity.Cycling}`);
    });

    it('should return an empty string if no activities is passed', () => {
      const result = stringifySelectedActivities(ctx);

      expect(result).toEqual('');
    });
  });

  describe('getActivitiesKeys', () => {
    it('should return all keys of Activities enum', () => {
      const keys: string[] = getActivitiesKeys();

      expect(keys).toHaveLength(Object.keys(Activity).length);
    });
  });
});
