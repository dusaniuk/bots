import { CallbackQuery } from 'telegraf/typings/telegram-types';

import { CatchResultContextData } from '../../../core/interfaces/catch';

import { BaseActionHandler } from '../base/base-action-handler';

export abstract class BaseAdminCatchDecisionHandler extends BaseActionHandler {
  protected getCatchDataFromCallbackQuery = (callbackQuery: CallbackQuery): CatchResultContextData => {
    const [, catchId, chatId] = callbackQuery.data.split(' ');

    return {
      chatId: +chatId,
      catchId,
    };
  };
}
