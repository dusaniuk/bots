/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { Context } from 'telegraf';
import * as faker from 'faker';

import { IncomingMessage } from 'telegraf/typings/telegram-types';

import * as helpers from './helpers';
import {
  CaptureRecord, Mention, Hunter, User,
} from '../models';

describe('heplers', () => {
  describe('createHunter', () => {
    it('should create hunter', () => {
      const context: Context = {
        from: {
          id: faker.random.number(),
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          username: faker.internet.userName(),
        },
      } as Context;

      const hunter: Hunter = helpers.createHunter(context);

      expect(hunter).to.eql({
        id: context.from.id,
        firstName: context.from.first_name,
        lastName: context.from.last_name,
        username: `@${context.from.username}`,
      });
    });

    it('should create hunter without username', () => {
      const context = { from: {}, chat: {} } as Context;

      const hunter: Hunter = helpers.createHunter(context);

      expect(hunter.username).to.be.undefined;
    });

    it('should create hunter without last name', () => {
      const context = { from: {}, chat: {} } as Context;

      const hunter: Hunter = helpers.createHunter(context);

      expect(hunter.lastName).to.be.undefined;
    });
  });

  describe('getGreetingNameForUser', () => {
    it('should return username as hunter name if it has been set', () => {
      const hunter: User = {
        username: faker.internet.userName(),
        firstName: faker.name.firstName(),
      } as User;

      const name = helpers.getGreetingNameForUser(hunter);

      expect(name).to.eq(hunter.username);
    });

    it("should return user's first name if username is not set", () => {
      const hunter: User = {
        firstName: faker.name.firstName(),
      } as User;

      const name = helpers.getGreetingNameForUser(hunter);

      expect(name).to.eq(hunter.firstName);
    });

    it("should return user's first and last names if last name is provided", () => {
      const hunter: User = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      } as User;

      const name = helpers.getGreetingNameForUser(hunter);

      expect(name).to.eq(`${hunter.firstName} ${hunter.lastName}`);
    });
  });

  describe('getMentions', () => {
    it('should return an empty array if no entities provided', () => {
      const message: IncomingMessage = {
        entities: [],
        text: '',
      } as IncomingMessage;

      const mentionedUsers: Mention[] = helpers.getMentions(message);

      expect(mentionedUsers).to.eql([]);
    });

    it("should return an empty array if there's no mentions in messages entity", () => {
      const message: IncomingMessage = {
        entities: [{ type: 'phone_number', offset: 0, length: 6 }, { type: 'email', offset: 7, length: 10 }],
        text: `${faker.phone.phoneNumber()} ${faker.internet.exampleEmail()}`,
      } as IncomingMessage;

      const mentionedUsers: Mention[] = helpers.getMentions(message);

      expect(mentionedUsers).to.eql([]);
    });

    it('should return one entity with username provided', () => {
      const username = faker.internet.userName();

      const message: IncomingMessage = {
        entities: [{ type: 'mention', offset: 0, length: username.length }],
        text: username,
      } as IncomingMessage;

      const mentionedUsers: Mention[] = helpers.getMentions(message);

      expect(mentionedUsers).to.have.lengthOf(1);
      expect(mentionedUsers[0].username).to.eq(username);
    });

    it('should return one entity with id provided', () => {
      const id = faker.random.number();

      const message: IncomingMessage = {
        entities: [{ type: 'text_mention', user: { id } }],
        text: faker.name.firstName(),
      } as IncomingMessage;

      const mentionedUsers: Mention[] = helpers.getMentions(message);

      expect(mentionedUsers).to.have.lengthOf(1);
      expect(mentionedUsers[0].id).to.eq(id);
    });

    it('should throw an error if sometime telegram would add new type of mention', () => {
      const message: IncomingMessage = {
        entities: [{ type: 'just_fake_mention' }],
      } as IncomingMessage;

      expect(() => helpers.getMentions(message)).to.throw;
    });
  });

  describe('getMentionedUsers', () => {
    it("should return mentioned by id if it's in db", () => {
      const id = faker.random.number();

      const mentions: Mention[] = [{ id }];
      const users: User[] = [{ id }];

      const mentionedUsers = helpers.getMentionedUsers(mentions, users);

      expect(mentionedUsers).to.have.lengthOf(1);
      expect(mentionedUsers[0]).to.eq(users[0]);
    });

    it("shouldn't return mentioned by id if it isn't in db", () => {
      const mentions: Mention[] = [{ id: faker.random.number() }];
      const users: User[] = [];

      const mentionedUsers = helpers.getMentionedUsers(mentions, users);

      expect(mentionedUsers).to.have.lengthOf(0);
    });

    it("should return mentioned username id if it's in db", () => {
      const username = faker.internet.userName();

      const mentions: Mention[] = [{ username }];
      const users: User[] = [{ username } as User];

      const mentionedUsers = helpers.getMentionedUsers(mentions, users);

      expect(mentionedUsers).to.have.lengthOf(1);
      expect(mentionedUsers[0]).to.eq(users[0]);
    });

    it("should return mentioned username id if it isn't in db", () => {
      const username = faker.internet.userName();

      const mentions: Mention[] = [{ username }];
      const users: User[] = [];

      const mentionedUsers = helpers.getMentionedUsers(mentions, users);

      expect(mentionedUsers).to.have.lengthOf(1);
      expect(mentionedUsers[0]).to.eql({ username });
    });
  });
});
