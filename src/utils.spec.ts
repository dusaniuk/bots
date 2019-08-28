import { expect } from 'chai';
import { Context } from 'telegraf';
import * as faker from 'faker';

import { createHunter, getHunterName } from './utils';
import { Hunter } from './models/hunter.model';

describe('main', () => {
  describe('createHunter', () => {
    it('should create hunter', () => {
      const context: Context = {
        from: {
          id: 1,
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          username: faker.internet.userName(),
        },
      } as Context;

      const hunter: Hunter = createHunter(context);

      expect(hunter).to.eql({
        id: context.from.id,
        firstName: context.from.first_name,
        lastName: context.from.last_name,
        username: context.from.username,
      });
    });
  });

  describe('getHunterName', () => {
    it('should return username as hunter name if it has been set', () => {
      const hunter: Hunter = {
        username: faker.internet.userName(),
        firstName: faker.name.firstName(),
      } as Hunter;

      const name = getHunterName(hunter);

      expect(name).to.eq(hunter.username);
    });

    it("should return user's first name if username is not set", () => {
      const hunter: Hunter = {
        firstName: faker.name.firstName(),
      } as Hunter;

      const name = getHunterName(hunter);

      expect(name).to.eq(hunter.firstName);
    });

    it("should return user's first and last names if last name is provided", () => {
      const hunter: Hunter = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      } as Hunter;

      const name = getHunterName(hunter);

      expect(name).to.eq(`${hunter.firstName} ${hunter.lastName}`);
    });
  });
});
