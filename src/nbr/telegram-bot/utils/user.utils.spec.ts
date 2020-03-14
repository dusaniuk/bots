import * as faker from 'faker';
import { User as TelegrafUser } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../../shared/interfaces/app-context';
import { stringifyUserGreeting, stringifyUsers } from './user.utils';

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

  describe('stringifyUsers', () => {
    it('should return full name for one user', () => {
      const user: TelegrafUser = {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
      } as TelegrafUser;

      const result = stringifyUsers([user]);

      expect(result).toEqual(`${user.first_name} ${user.last_name}`);
    });

    it('should return only first name for one user', () => {
      const user: TelegrafUser = {
        first_name: faker.name.firstName(),
      } as TelegrafUser;

      const result = stringifyUsers([user]);

      expect(result).toEqual(`${user.first_name}`);
    });

    it('should return first names for 2 users', () => {
      const userA: TelegrafUser = {
        first_name: faker.name.firstName(),
      } as TelegrafUser;

      const userB: TelegrafUser = {
        first_name: faker.name.firstName(),
      } as TelegrafUser;

      const result = stringifyUsers([userA, userB]);

      expect(result).toEqual(`${userA.first_name}, ${userB.first_name}`);
    });
  });
});
