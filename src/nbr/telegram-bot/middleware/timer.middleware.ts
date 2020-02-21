import { Middleware } from 'telegraf';
import { CronJob } from 'cron';

import { AppContext } from '../../../shared/interfaces';
import { CONFIG } from '../../../config';
import { Logger } from '../../../shared/logger';

let isFeedStarted = false;

const CRON_PATTERN = CONFIG.feedSchedule.pattern;
const TARGET_CHAT = CONFIG.feedSchedule.targetChat;

export const feedSchedule = async (ctx: AppContext, next: () => any): Promise<{}> => {
  if (!CRON_PATTERN && !TARGET_CHAT) {
    Logger.error('[cron]: can\'t start scheduler without cron pattern and target chat');
    return next();
  }

  if (isFeedStarted) {
    return next();
  }

  Logger.info(`[cron] scheduler started at: ${CRON_PATTERN} for chat ${TARGET_CHAT}`);

  const job = new CronJob(
    CRON_PATTERN,
    () => {
      ctx.telegram.sendMessage(TARGET_CHAT, ctx.i18n.t('chats.feed'), { parse_mode: 'Markdown' });
    },
    null,
    false,
    'Europe/Kiev',
  );

  job.start();
  isFeedStarted = true;

  return next();
};

export const useFeedSchedule = (): Middleware<AppContext> => feedSchedule;
