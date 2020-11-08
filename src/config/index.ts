import dotenv from 'dotenv';

import { AppConfig } from './interfaces';

dotenv.config();

export const CONFIG: AppConfig = {
  environment: process.env.ENVIRONMENT,
  isDevMode: process.env.ENVIRONMENT === 'dev',
  port: +(process.env.PORT ?? 8080),
  feedSchedule: {
    pattern: process.env.FEED_PATTERN,
    targetChat: +process.env.FEED_TARGET,
  },

  more: {
    botToken: process.env.MORE_BOT_TOKEN,
    database: {
      clientEmail: process.env.MORE_DB_CLIENT_EMAIL,
      privateKey: process.env.MORE_DB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      databaseURL: process.env.MORE_DB_DATABASE_URL,
      projectId: process.env.MORE_DB_PROJECT_ID,
    },
  },
};
