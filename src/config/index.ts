import dotenv from 'dotenv';

import { AppConfig } from './interfaces';

dotenv.config();

export const CONFIG: AppConfig = {
  environment: process.env.ENVIRONMENT,
  isDevMode: process.env.ENVIRONMENT === 'dev',
  port: +(process.env.PORT ?? 8080),

  more: {
    botToken: process.env.BOT_TOKEN,
    database: {
      clientEmail: process.env.DB_CLIENT_EMAIL,
      privateKey: process.env.DB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      databaseURL: process.env.DB_DATABASE_URL,
      projectId: process.env.DB_PROJECT_ID,
    },
  },
};
