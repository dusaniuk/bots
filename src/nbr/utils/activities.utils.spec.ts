import { Activity } from '../constants/enums';
import { getNormalizedActivities } from './activities.utils';
import { AppContext } from '../../shared/models/appContext';

jest.mock('./title.utils', () => ({
  getTitle: jest.fn().mockImplementation((ctx, activity) => activity),
}));

describe('activities.utils', () => {
  describe('getNormalizedActivities', () => {
    let ctx: AppContext;

    beforeEach(() => {
      ctx = {} as AppContext;
    });

    it('should return list of activities', () => {
      const activities: string[] = [Activity.Cycling, Activity.Run, Activity.Climb];

      const result = getNormalizedActivities(ctx, activities);

      expect(result).toEqual(`${Activity.Cycling}, ${Activity.Run}, ${Activity.Climb}`);
    });

    it('should return only All activity if it is included in activities array', () => {
      const activities: string[] = [Activity.Cycling, Activity.Run, Activity.All];

      const result = getNormalizedActivities(ctx, activities);

      expect(result).toEqual(`${Activity.All}`);
    });

    it("should return only one title name if there's only one item in activities", () => {
      const activities: string[] = [Activity.Cycling];

      const result = getNormalizedActivities(ctx, activities);

      expect(result).toEqual(`${Activity.Cycling}`);
    });

    it('should return an empty string if no activities is passed', () => {
      const result = getNormalizedActivities(ctx);

      expect(result).toEqual('');
    });
  });
});
