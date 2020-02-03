import { AppContext } from '../src/shared/models/appContext';

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
    reply: jest.fn().mockReturnValue(Promise.resolve({ chat: {} })),
    replyWithMarkdown: jest.fn().mockReturnValue(Promise.resolve({})),
    editMessageText: jest.fn().mockReturnValue(Promise.resolve({})),
    deleteMessage: jest.fn().mockReturnValue(Promise.resolve({})),
    telegram: {
      deleteMessage: jest.fn().mockReturnValue(Promise.resolve({})),
    },
  } as any;
};
