import * as faker from 'faker';

import { IncomingMessage, User as TelegrafUser } from 'telegraf/typings/telegram-types';
import * as helpers from './helpers';
import { Mention, User } from '../models';

describe('heplers', () => {
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
        username: `@${telegrafUser.username}`,
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

  describe('getMentions', () => {
    it('should return an empty array if no entities provided', () => {
      const message: IncomingMessage = {
        entities: [],
        text: '',
      } as IncomingMessage;

      const mentionedUsers: Mention[] = helpers.getMentions(message);

      expect(mentionedUsers).toEqual([]);
    });

    it("should return an empty array if there's no mentions in messages entity", () => {
      const message: IncomingMessage = {
        entities: [{ type: 'phone_number', offset: 0, length: 6 }, { type: 'email', offset: 7, length: 10 }],
        text: `${faker.phone.phoneNumber()} ${faker.internet.exampleEmail()}`,
      } as IncomingMessage;

      const mentionedUsers: Mention[] = helpers.getMentions(message);

      expect(mentionedUsers).toEqual([]);
    });

    it('should return one entity with username provided', () => {
      const username = faker.internet.userName();

      const message: IncomingMessage = {
        entities: [{ type: 'mention', offset: 0, length: username.length }],
        text: username,
      } as IncomingMessage;

      const mentionedUsers: Mention[] = helpers.getMentions(message);

      expect(mentionedUsers).toHaveLength(1);
      expect(mentionedUsers[0].username).toEqual(username);
    });

    it('should return one entity with id provided', () => {
      const id = faker.random.number();

      const message: IncomingMessage = {
        entities: [{ type: 'text_mention', user: { id } }],
        text: faker.name.firstName(),
      } as IncomingMessage;

      const mentionedUsers: Mention[] = helpers.getMentions(message);

      expect(mentionedUsers).toHaveLength(1);
      expect(mentionedUsers[0].id).toEqual(id);
    });

    it('should throw an error if sometime telegram would add new type of mention', () => {
      const message: IncomingMessage = {
        entities: [{ type: 'just_fake_mention' }],
      } as IncomingMessage;

      expect(() => helpers.getMentions(message)).toThrowError();
    });
  });

  describe('getMentionedUsers', () => {
    it("should return mentioned by id if it's in db", () => {
      const id = faker.random.number();

      const mentions: Mention[] = [{ id }];
      const users: User[] = [{ id }];

      const mentionedUsers = helpers.getMentionedUsers(mentions, users);

      expect(mentionedUsers).toHaveLength(1);
      expect(mentionedUsers[0]).toEqual(users[0]);
    });

    it("shouldn't return mentioned by id if it isn't in db", () => {
      const mentions: Mention[] = [{ id: faker.random.number() }];
      const users: User[] = [];

      const mentionedUsers = helpers.getMentionedUsers(mentions, users);

      expect(mentionedUsers).toHaveLength(0);
    });

    it("should return mentioned username id if it's in db", () => {
      const username = faker.internet.userName();

      const mentions: Mention[] = [{ username }];
      const users: User[] = [{ username } as User];

      const mentionedUsers = helpers.getMentionedUsers(mentions, users);

      expect(mentionedUsers).toHaveLength(1);
      expect(mentionedUsers[0]).toEqual(users[0]);
    });

    it("should return mentioned username id if it isn't in db", () => {
      const username = faker.internet.userName();

      const mentions: Mention[] = [{ username }];
      const users: User[] = [];

      const mentionedUsers = helpers.getMentionedUsers(mentions, users);

      expect(mentionedUsers).toHaveLength(1);
      expect(mentionedUsers[0]).toEqual({ username });
    });
  });
});
