import * as faker from 'faker';

import { User as TelegrafUser } from 'telegraf/typings/telegram-types';
import * as helpers from './helpers';
import { User } from '../interfaces';

describe('helpers', () => {
  describe('createUser', () => {
    it('should create user', () => {
      const telegrafUser: TelegrafUser = {
        id: faker.random.number(),
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        username: faker.internet.userName(),
      } as TelegrafUser;

      const user: User = helpers.createUser(telegrafUser);

      expect(user).toEqual({
        id: telegrafUser.id,
        firstName: telegrafUser.first_name,
        lastName: telegrafUser.last_name,
        username: telegrafUser.username,
      });
    });

    it('should create user without username', () => {
      const telegrafUser = {
        id: faker.random.number(),
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
      } as TelegrafUser;

      const user: User = helpers.createUser(telegrafUser);

      expect(user.username).toBeUndefined();
    });

    it('should create user without last name', () => {
      const telegrafUser: TelegrafUser = {
        id: faker.random.number(),
        first_name: faker.name.firstName(),
        username: faker.internet.userName(),
      } as TelegrafUser;

      const user: User = helpers.createUser(telegrafUser);

      expect(user.lastName).toBeUndefined();
    });
  });

  describe('getGreetingNameForUser', () => {
    it('should return username as user name if it has been set', () => {
      const user: User = {
        username: faker.internet.userName(),
        firstName: faker.name.firstName(),
      } as User;

      const name = helpers.getGreetingNameForUser(user);

      expect(name).toEqual(user.username);
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
