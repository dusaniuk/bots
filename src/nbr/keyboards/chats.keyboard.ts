import { Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { AppContext } from '../models/appContext';

const CHATS_LINKS = {
  runPro: 'https://t.me/joinchat/JPBxH1jhwl1DgcBKLpGc-A',
  swim: 'https://t.me/joinchat/JPBxH1QE_EUFOZa2zwXxKg',
  climb: 'https://t.me/joinchat/FRDYHlGGoRNUbbTvy_M33w',
  stretch: 'https://t.me/joinchat/JPBxHxEN2_t7YtZV9ph5OQ',
  ironMan: 'https://t.me/joinchat/JPBxHw5Umu56q2iHHW-L5g',
};

export const getChatsKeyboard = ({ i18n }: AppContext): ExtraReplyMessage => {
  return Markup.inlineKeyboard([
    [Markup.urlButton(i18n.t('title.runPro'), CHATS_LINKS.runPro)],
    [Markup.urlButton(i18n.t('title.swim'), CHATS_LINKS.swim)],
    [Markup.urlButton(i18n.t('title.climb'), CHATS_LINKS.climb)],
    [Markup.urlButton(i18n.t('title.stretch'), CHATS_LINKS.stretch)],
    [Markup.urlButton(i18n.t('title.iron'), CHATS_LINKS.ironMan)],
  ]).extra();
};
