import * as faker from 'faker';

import { TelegramResponse } from './telegramResponse';
import { AppContext } from '../../shared/interfaces';

import { createMockContext } from '../../../test/context.mock';
import { CatchMentions } from '../models';
import { Mention, User } from '../interfaces';

jest.mock('../keyboards/approve.keyboard');
jest.mock('../utils/helpers');

describe('TelegramResponse', () => {
  let service: TelegramResponse;

  let ctx: AppContext;

  beforeEach(() => {
    jest.resetAllMocks();

    service = new TelegramResponse();

    ctx = createMockContext();
  });

  describe('notifyAdminAboutCatch', () => {
    it('should send message to admin', async () => {
      const catchId: string = faker.random.uuid();
      const admin: User = { id: faker.random.number() } as User;

      const mentionsData = new CatchMentions(admin, null, [], []);

      await service.notifyAdminAboutCatch(ctx, catchId, mentionsData);

      expect(ctx.telegram.sendMessage).toHaveBeenCalledWith(admin.id, 'catch.summary', undefined);
    });
  });

  describe('notifyChatAboutCatch', () => {
    it('should notify chat about catch', async () => {
      const mentionsData = new CatchMentions(null, null, [], []);

      await service.notifyChatAboutCatch(ctx, mentionsData);

      expect(ctx.replyWithMarkdown).toHaveBeenCalledWith('catch.message');
    });
  });

  describe('noUsersToCatch', () => {
    it('should send message that there are no mentions', async () => {
      await service.noUsersToCatch(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('error.noUsersToCatch');
    });
  });

  describe('rejectSelfCapture', () => {
    it('should reject self capture', async () => {
      await service.rejectSelfCapture(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('error.selfCatch');
    });
  });

  describe('showCatchInstruction', () => {
    it('should send catch instruction', async () => {
      await service.showCatchInstruction(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('other.howToCatch');
    });
  });

  describe('showUnverifiedMentions', () => {
    it('should send message with unverified users', async () => {
      const mentions: Mention[] = [
        { username: faker.internet.userName() },
        { username: faker.internet.userName() },
      ];

      await service.showUnverifiedMentions(ctx, mentions);

      expect(ctx.replyWithMarkdown).toHaveBeenCalledWith('error.nonRegisteredUsers');
      expect(ctx.i18n.t).toHaveBeenCalledWith(
        'error.nonRegisteredUsers',
        { users: `${mentions[0].username} ${mentions[1].username}` },
      );
    });
  });
});
