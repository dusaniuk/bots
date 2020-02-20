import * as faker from 'faker';

import { TelegramResponse } from './telegram-response';
import { AppContext } from '../../../shared/interfaces';

import { createMockContext } from '../../../../test/context.mock';
import { getGreetingNameForUser } from '../utils/helpers';
import { Logger } from '../../../shared/logger';

import { Mention } from '../../core/interfaces/catch';
import { User } from '../../core/interfaces/user';


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

  describe('deleteMessageFromAdminChat', () => {
    it('should delete message from context', async () => {
      await service.deleteMessageFromAdminChat(ctx);

      expect(ctx.deleteMessage).toHaveBeenCalled();
    });

    it('should console error if occured', async () => {
      const error = new Error(faker.random.words(5));
      ctx.deleteMessage = jest.fn().mockRejectedValue(error);

      jest.spyOn(Logger, 'error').mockReturnValue();

      await service.deleteMessageFromAdminChat(ctx);

      expect(Logger.error).toHaveBeenCalledWith(expect.any(String), error);
    });
  });

  // describe('notifyAdminAboutCatch', () => {
  //   it('should send message to admin', async () => {
  //     const catchId: string = faker.random.uuid();
  //     const admin: User = { id: faker.random.number() } as User;
  //
  //     const mentionsData = new CatchMentions(admin, null, [], []);
  //
  //     await service.notifyAdminAboutCatch(ctx, catchId, mentionsData);
  //
  //     expect(ctx.telegram.sendMessage).toHaveBeenCalledWith(admin.id, 'catch.summary', undefined);
  //   });
  // });

  describe('notifyAdminAboutHandledCatch', () => {
    it('should answer with callback query', async () => {
      await service.notifyAdminAboutHandledCatch(ctx);

      expect(ctx.answerCbQuery).toHaveBeenCalledWith('other.handled');
    });
  });

  // describe('notifyChatAboutCatch', () => {
  //   it('should notify chat about catch', async () => {
  //     const mentionsData = new CatchMentions(null, null, [], []);
  //
  //     await service.notifyChatAboutCatch(ctx, mentionsData);
  //
  //     expect(ctx.replyWithMarkdown).toHaveBeenCalledWith('catch.message');
  //   });
  // });

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

  describe('sayAboutSucceededCatch', () => {
    let chatId: number;
    let hunter: User;
    let earnedPoints: number;

    beforeEach(() => {
      chatId = faker.random.number();
      hunter = {} as User;
      earnedPoints = faker.random.number(100);
    });

    it('should call greeting name for user', async () => {
      await service.sayAboutSucceededCatch(ctx, chatId, hunter, earnedPoints);

      expect(getGreetingNameForUser).toHaveBeenCalledWith(hunter);
    });

    it('should send message into provided chat', async () => {
      await service.sayAboutSucceededCatch(ctx, chatId, hunter, earnedPoints);

      expect(ctx.telegram.sendMessage).toHaveBeenCalledWith(chatId, 'catch.approved');
      expect(ctx.i18n.t).toHaveBeenCalledWith('catch.approved', {
        user: undefined,
        points: earnedPoints,
      });
    });
  });

  describe('sayAboutFailedCatch', () => {
    let chatId: number;
    let hunter: User;

    beforeEach(() => {
      chatId = faker.random.number();
      hunter = {} as User;
    });

    it('should call greeting name for user', async () => {
      await service.sayAboutFailedCatch(ctx, chatId, hunter);

      expect(getGreetingNameForUser).toHaveBeenCalledWith(hunter);
    });

    it('should send message into provided chat', async () => {
      await service.sayAboutFailedCatch(ctx, chatId, hunter);

      expect(ctx.telegram.sendMessage).toHaveBeenCalledWith(chatId, 'catch.rejected');
      expect(ctx.i18n.t).toHaveBeenCalledWith('catch.rejected', expect.anything());
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
