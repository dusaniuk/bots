import { Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { AppContext } from '../../../shared/interfaces';

const CHATS_LINKS = {
  runPro: 'https://t.me/joinchat/JPBxH1jhwl1DgcBKLpGc-A',
  swim: 'https://t.me/joinchat/JPBxH1QE_EUFOZa2zwXxKg',
  climb: 'https://t.me/joinchat/FRDYHlGGoRNUbbTvy_M33w',
  ocr: 'https://t.me/NBROCR',
  ironMan: 'https://t.me/joinchat/LxGz3k_Tew-5aTNlkhkavQ',
};

export const getChatsKeyboard = ({ i18n }: AppContext): ExtraReplyMessage => {
  return Markup.inlineKeyboard([
    // [Markup.urlButton(i18n.t('title.runPro'), CHATS_LINKS.runPro)],
    [Markup.urlButton(i18n.t('title.swim'), CHATS_LINKS.swim)],
    [Markup.urlButton(i18n.t('title.climb'), CHATS_LINKS.climb)],
    [Markup.urlButton(i18n.t('title.ocr'), CHATS_LINKS.ocr)],
    [Markup.urlButton(i18n.t('title.iron'), CHATS_LINKS.ironMan)],
  ]).extra();
};
