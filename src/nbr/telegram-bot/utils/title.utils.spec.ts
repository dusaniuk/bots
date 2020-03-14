import { AppContext } from '../../../shared/interfaces';

import { createMockContext } from '../../../../test/context.mock';

import { getTitle, getTitleWithEmoji } from './title.utils';


describe('title.utils', () => {
  let mockContext: AppContext;
  let key: string;

  beforeEach(() => {
    mockContext = createMockContext();

    key = 'some string 🥺';
  });

  describe('getTitleWithEmoji', () => {
    it('should return title', () => {
      const result = getTitleWithEmoji(mockContext, key);
      expect(result).toEqual(`title.${key}`);
    });
  });

  describe('getTitle', () => {
    it("should return title without last element (with my templates it's a emoji", () => {
      const result = getTitle(mockContext, key);
      expect(result).toEqual('title.some string');
    });
  });
});
