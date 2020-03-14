import * as faker from 'faker';

import { createMockContext } from '../../../test/context.mock';
import { AppContext, ReplyData } from '../interfaces';

import { BaseReplyService } from './base-reply.service';


class MockBaseReplyService extends BaseReplyService {
  public get context(): AppContext {
    return this.ctx;
  }

  constructor() {
    super(createMockContext());
  }

  public callReply = async (resourceKey: string, replyData?: ReplyData): Promise<void> => {
    this.reply(resourceKey, replyData);
  };

  public callSendMessage = async (chatId: number, resourceKey: string, replyData?: ReplyData): Promise<void> => {
    this.sendMessage(chatId, resourceKey, replyData);
  };

  public callAnswerCbQuery = async (resourceKey: string): Promise<void> => {
    this.answerCbQuery(resourceKey);
  };

  public callDeleteLastMessage = async (): Promise<void> => {
    this.deleteLastMessage();
  };
}

describe('BaseReplyService', () => {
  let service: MockBaseReplyService;

  let ctx: AppContext;

  beforeEach(() => {
    service = new MockBaseReplyService();
    ctx = service.context;
  });

  describe('reply', () => {
    let resourceKey: string;

    beforeEach(() => {
      resourceKey = faker.random.uuid();
    });

    it('should call i18n with resourceKey and templateData', () => {
      const replyData: ReplyData = { templateData: {} };

      service.callReply(resourceKey, replyData);

      expect(ctx.i18n.t).toHaveBeenCalledWith(resourceKey, replyData.templateData);
    });

    it('should call i18n with resourceKey', () => {
      service.callReply(resourceKey);

      expect(ctx.i18n.t).toHaveBeenCalledWith(resourceKey);
    });

    it('should call replyWithMarkdown with message and extra', () => {
      const replyData: ReplyData = { extra: {} };

      service.callReply(resourceKey, replyData);

      expect(ctx.replyWithMarkdown).toHaveBeenCalledWith(resourceKey, replyData.extra);
    });

    it('should call replyWithMarkdown with message', () => {
      service.callReply(resourceKey);

      expect(ctx.replyWithMarkdown).toHaveBeenCalledWith(resourceKey);
    });
  });

  describe('sendMessage', () => {
    let chatId: number;
    let resourceKey: string;

    beforeEach(() => {
      chatId = faker.random.number();
      resourceKey = faker.random.uuid();
    });

    it('should call i18n with resourceKey and templateData', () => {
      const replyData: ReplyData = { templateData: {} };

      service.callSendMessage(chatId, resourceKey, replyData);

      expect(ctx.i18n.t).toHaveBeenCalledWith(resourceKey, replyData.templateData);
    });

    it('should call i18n with resourceKey', () => {
      service.callSendMessage(chatId, resourceKey);

      expect(ctx.i18n.t).toHaveBeenCalledWith(resourceKey);
    });

    it('should call telegram.sendMessage with extra', () => {
      const replyData: ReplyData = { extra: {} };

      service.callSendMessage(chatId, resourceKey, replyData);

      expect(ctx.telegram.sendMessage).toHaveBeenCalledWith(chatId, resourceKey, replyData.extra);
    });

    it('should call telegram.sendMessage without extra', () => {
      service.callSendMessage(chatId, resourceKey);

      expect(ctx.telegram.sendMessage).toHaveBeenCalledWith(chatId, resourceKey);
    });
  });

  describe('answerCbQuery', () => {
    let resourceKey: string;

    beforeEach(() => {
      resourceKey = faker.random.uuid();
    });

    it('should call i18n with resourceKey', () => {
      service.callAnswerCbQuery(resourceKey);

      expect(ctx.i18n.t).toHaveBeenCalledWith(resourceKey);
    });

    it('should answer cb query with message', () => {
      service.callAnswerCbQuery(resourceKey);

      expect(ctx.answerCbQuery).toHaveBeenCalledWith(resourceKey);
    });
  });

  describe('deleteLastMessage', () => {
    it('should call context\'s delete message', () => {
      service.callDeleteLastMessage();

      expect(ctx.deleteMessage).toHaveBeenCalled();
    });
  });
});
