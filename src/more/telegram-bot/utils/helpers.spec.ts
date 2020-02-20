import * as faker from 'faker';

import { User } from '../../core/interfaces/user';

import * as helpers from './helpers';

describe('helpers', () => {
  describe('getGreetingNameForUser', () => {
    it('should return username as user name if it has been set', () => {
      const user: User = {
        username: faker.internet.userName(),
        firstName: faker.name.firstName(),
      } as User;

      const name = helpers.getGreetingNameForUser(user);

      expect(name).toEqual(`@${user.username}`);
    });

    it("should return user's first name if username is not set", () => {
      const user: User = {
        firstName: faker.name.firstName(),
      } as User;

      const name = helpers.getGreetingNameForUser(user);

      expect(name).toEqual(user.firstName);
    });

    it("should return user's first and last names if last name is provided", () => {
      const user: User = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      } as User;

      const name = helpers.getGreetingNameForUser(user);

      expect(name).toEqual(`${user.firstName} ${user.lastName}`);
    });
  });
});
