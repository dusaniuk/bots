import * as faker from 'faker';

import { AppContext } from '../../shared/models/appContext';
import { stringifyUserGreeting } from './user.utils';

describe('user.utils', () => {
  describe('stringifyUserGreeting', () => {
    let mockContext: AppContext;

    beforeEach(() => {
      mockContext = {
        from: {},
      } as AppContext;
    });

    it("should return only user's first name", () => {
      const firstName = faker.name.firstName();
      mockContext.from.first_name = firstName;

      const result = stringifyUserGreeting(mockContext);

      expect(result).toEqual(`*${firstName}*`);
    });

    it("should return user's first and last names", () => {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      mockContext.from.first_name = firstName;
      mockContext.from.last_name = lastName;

      const result = stringifyUserGreeting(mockContext);

      expect(result).toEqual(`*${firstName} ${lastName}*`);
    });

    it("should return user's full name with username", () => {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const username = faker.internet.userName(firstName, lastName);
      mockContext.from.first_name = firstName;
      mockContext.from.last_name = lastName;
      mockContext.from.username = username;

      const result = stringifyUserGreeting(mockContext);

      expect(result).toEqual(`*${firstName} ${lastName}* (@${username})`);
    });

    it("should return user's first name with username", () => {
      const firstName = faker.name.firstName();
      const username = faker.internet.userName(firstName);
      mockContext.from.first_name = firstName;
      mockContext.from.username = username;

      const result = stringifyUserGreeting(mockContext);

      expect(result).toEqual(`*${firstName}* (@${username})`);
    });
  });
});
