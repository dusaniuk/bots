import { AppContext } from '../src/shared/interfaces/app-context';

export const createMockContext = (): AppContext => {
  return {
    scene: {
      state: {},
      reenter: jest.fn(),
      leave: jest.fn(),
    },
    callbackQuery: {},
    i18n: {
      t: jest.fn().mockImplementation((pattern: string) => pattern),
    },
    answerCbQuery: jest.fn().mockResolvedValue({}),
    reply: jest.fn().mockResolvedValue({ chat: {} }),
    replyWithMarkdown: jest.fn().mockResolvedValue({}),
    editMessageText: jest.fn().mockResolvedValue({}),
    deleteMessage: jest.fn().mockResolvedValue({}),
    telegram: {
      sendMessage: jest.fn().mockResolvedValue({}),
      deleteMessage: jest.fn().mockResolvedValue({}),
    },
  } as any;
};
