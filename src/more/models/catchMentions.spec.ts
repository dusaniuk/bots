import * as faker from 'faker';

import { CatchMentions } from './catchMentions';
import { Mention, User } from '../interfaces';

describe('CatchMentions', () => {
  let catchMentions: CatchMentions;

  describe('hasMentions', () => {
    it('should return false if there are no mentioned users', () => {
      catchMentions = new CatchMentions(null, null, [], []);

      expect(catchMentions.hasMentions).toBeFalsy();
    });

    it('should return true if there at least one mention', () => {
      catchMentions = new CatchMentions(null, null, [{} as User], []);

      expect(catchMentions.hasMentions).toBeTruthy();
    });
  });

  describe('haveUnverifiedMentions', () => {
    it('should return false if all mentions are verified', () => {
      catchMentions = new CatchMentions(null, null, [], []);

      expect(catchMentions.haveUnverifiedMentions).toBeFalsy();
    });

    it('should return true if there are unverified mentions', () => {
      catchMentions = new CatchMentions(null, null, [], [{} as Mention]);

      expect(catchMentions.haveUnverifiedMentions).toBeTruthy();
    });
  });

  describe('haveVictims', () => {
    it('should return false if there are no victims', () => {
      catchMentions = new CatchMentions(null, null, [], []);

      expect(catchMentions.haveVictims).toBeFalsy();
    });

    it('should return true if there are victims', () => {
      catchMentions = new CatchMentions(null, null, [{} as User], []);

      expect(catchMentions.haveVictims).toBeTruthy();
    });
  });

  describe('isMentionedHimself', () => {
    let hunter: User;

    beforeEach(() => {
      hunter = { id: faker.random.number() } as User;
    });

    it('should return false if victims does not includes hunter', () => {
      catchMentions = new CatchMentions(null, hunter, [], []);

      expect(catchMentions.isMentionedHimself).toBeFalsy();
    });

    it('should return false if victims does not includes hunter', () => {
      catchMentions = new CatchMentions(null, hunter, [hunter], []);

      expect(catchMentions.isMentionedHimself).toBeTruthy();
    });
  });
});
