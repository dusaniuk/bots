import { AppContext } from '../src/shared/interfaces/appContext';

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
