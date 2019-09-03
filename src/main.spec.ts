import { expect } from 'chai';
import * as faker from 'faker';
import { IncomingMessage } from 'telegraf/typings/telegram-types';

import { getMentionedUsers, MentionedUser } from './main';

describe('main', () => {
  describe('getMentionedUsers', () => {
    it('should return an empty array if no entities provided', () => {
      const message: IncomingMessage = {
        entities: [],
        text: '',
      } as IncomingMessage;

      const mentionedUsers: MentionedUser[] = getMentionedUsers(message);

      expect(mentionedUsers).to.eql([]);
    });

    it("should return an empty array if there's no mentions in messages entity", () => {
      const message: IncomingMessage = {
        entities: [
          { type: 'phone_number', offset: 0, length: 6 },
          { type: 'email', offset: 7, length: 10 },
        ],
        text: `${faker.phone.phoneNumber()} ${faker.internet.exampleEmail()}`,
      } as IncomingMessage;

      const mentionedUsers: MentionedUser[] = getMentionedUsers(message);

      expect(mentionedUsers).to.eql([]);
    });

    it('should return one entity with username provided', () => {
      const username = faker.internet.userName();

      const message: IncomingMessage = {
        entities: [{ type: 'mention', offset: 0, length: username.length }],
        text: username,
      } as IncomingMessage;

      const mentionedUsers: MentionedUser[] = getMentionedUsers(message);

      expect(mentionedUsers).to.have.lengthOf(1);
      expect(mentionedUsers[0].username).to.eq(username);
    });

    it('should return one entity with id provided', () => {
      const id = faker.random.number();

      const message: IncomingMessage = {
        entities: [{ type: 'text_mention', user: { id } }],
        text: faker.name.firstName(),
      } as IncomingMessage;

      const mentionedUsers: MentionedUser[] = getMentionedUsers(message);

      expect(mentionedUsers).to.have.lengthOf(1);
      expect(mentionedUsers[0].id).to.eq(id);
    });
  });
});
