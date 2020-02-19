import { Mention } from '../interfaces/catch';
import { User } from '../interfaces/user';

import { CatchMentions } from './catchMentions';


describe('CatchMentions', () => {
  let catchMentions: CatchMentions;

  describe('hasMentions', () => {
    it('should return false if there are no mentioned users', () => {
      catchMentions = new CatchMentions([], []);

      expect(catchMentions.hasAnyMentions).toBeFalsy();
    });

    it('should return true if there at least one mention', () => {
      catchMentions = new CatchMentions([{} as User], []);

      expect(catchMentions.hasAnyMentions).toBeTruthy();
    });
  });

  describe('haveUnverifiedMentions', () => {
    it('should return false if all mentions are verified', () => {
      catchMentions = new CatchMentions([], []);

      expect(catchMentions.hasUnverifiedMentions).toBeFalsy();
    });

    it('should return true if there are unverified mentions', () => {
      catchMentions = new CatchMentions([], [{} as Mention]);

      expect(catchMentions.hasUnverifiedMentions).toBeTruthy();
    });
  });

  describe('haveVictims', () => {
    it('should return false if there are no victims', () => {
      catchMentions = new CatchMentions([], []);

      expect(catchMentions.haveVictims).toBeFalsy();
    });

    it('should return true if there are victims', () => {
      catchMentions = new CatchMentions([{} as User], []);

      expect(catchMentions.haveVictims).toBeTruthy();
    });
  });
});
