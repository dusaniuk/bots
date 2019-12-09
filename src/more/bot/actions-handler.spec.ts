import { ContextMessageUpdate } from 'telegraf';
import { CallbackQuery, Message, MessageSticker } from 'telegraf/typings/telegram-types';

import { ActionsHandler } from './actions-handler';
import { Database } from '../interfaces/database';
import { TelegrafResponseService } from '../services/telegraf-response.service';

describe('ActionsHandler', () => {
  let handler: ActionsHandler;

  let db;
  let response;

  let ctx: ContextMessageUpdate;

  beforeEach(() => {
    db = jest.genMockFromModule<Database>('../interfaces/database');
    response = jest.genMockFromModule<TelegrafResponseService>('../services/telegraf-response.service');

    handler = new ActionsHandler(db, response);

    ctx = { from: {}, chat: {} } as ContextMessageUpdate;
  });

  describe('ping', () => {
    let res: Message;

    beforeEach(() => {
      res = {} as Message;

      response.pong = jest.fn(() => Promise.resolve(res));
    });

    it('should return pong message', async () => {
      const msg = await handler.pong(ctx);

      expect(response.pong).toHaveBeenCalledWith(ctx);
      expect(msg).toEqual(res);
    });
  });

  describe('register', () => {
    it('should send request to check if user is in chat', async () => {
      const [chatId, fromId] = [1, 2];
      ctx.chat.id = chatId;
      ctx.from.id = fromId;

      db.isUserInChat = jest.fn();
      db.addUserInChat = jest.fn();
      response.greetNewUser = jest.fn();

      await handler.register(ctx);

      expect(db.isUserInChat).toHaveBeenCalledWith(chatId, fromId);
    });

    it("should say that user in game if he's in chat", async () => {
      const msg = {} as MessageSticker;

      db.isUserInChat = jest.fn(() => Promise.resolve(true));
      response.userAlreadyInGame = jest.fn(() => Promise.resolve(msg));

      const res = await handler.register(ctx);

      expect(res).toEqual(msg);
    });

    it('should add user in chat', async () => {
      const chatId = 1;
      ctx.chat.id = chatId;

      db.isUserInChat = jest.fn(() => Promise.resolve(false));
      db.addUserInChat = jest.fn();
      response.greetNewUser = jest.fn();

      await handler.register(ctx);

      expect(db.addUserInChat).toHaveBeenCalledWith(chatId, expect.anything());
    });

    it('should greet new user', async () => {
      const msg = {} as MessageSticker;

      db.isUserInChat = jest.fn(() => Promise.resolve(false));
      db.addUserInChat = jest.fn();
      response.greetNewUser = jest.fn(() => Promise.resolve(msg));

      const res = await handler.register(ctx);

      expect(res).toEqual(msg);
    });
  });

  describe('getScore', () => {
    it('should get all users from chat', async () => {
      const chatId = 1;
      ctx.chat.id = chatId;

      db.getAllUsersFromChat = jest.fn(() => Promise.resolve([]));
      response.getHuntersScore = jest.fn();

      await handler.getScore(ctx);

      expect(db.getAllUsersFromChat).toHaveBeenCalledWith(chatId);
    });

    it('should return hunters score', async () => {
      const msg = {} as MessageSticker;

      db.getAllUsersFromChat = jest.fn(() => Promise.resolve([]));
      response.getHuntersScore = jest.fn(() => Promise.resolve(msg));

      const res = await handler.getScore(ctx);

      expect(response.getHuntersScore).toHaveBeenCalledWith(ctx, expect.anything());
      expect(res).toEqual(msg);
    });
  });

  describe('handleAdminAnswer', () => {
    describe('handleHunterCapture', () => {
      beforeEach(() => {
        db.getCaptureRecord = jest.fn();
        db.getUserFromChat = jest.fn();
        db.approveCaptureRecord = jest.fn();
        db.updateUserPoints = jest.fn();
      });
    });

    it('should throw an error if answer has unsupported type', async () => {
      ctx.callbackQuery = { data: 'invalid answer type' } as CallbackQuery;

      await expect(handler.handleAdminAnswer(ctx)).rejects.toThrow();
    });
  });

  describe('getHelp', () => {
    it('should explain rules to user', async () => {
      const msg = {} as Message;

      response.explainRulesToUser = jest.fn(() => Promise.resolve(msg));

      const res = await handler.getHelp(ctx);

      expect(response.explainRulesToUser).toHaveBeenCalledWith(ctx);
      expect(res).toEqual(msg);
    });
  });
});
