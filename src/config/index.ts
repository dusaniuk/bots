import dotenv from 'dotenv';

import { AppConfig } from './interfaces';

dotenv.config();

export const CONFIG: AppConfig = {
  environment: process.env.ENVIRONMENT,
  isDevMode: process.env.ENVIRONMENT === 'dev',
  port: +process.env.PORT || 8080,
  feedSchedule: {
    pattern: process.env.FEED_PATTERN,
    targetChat: +process.env.FEED_TARGET,
  },
  more: {
    botToken: process.env.MORE_BOT_TOKEN,
  },
  nbr: {
    botToken: process.env.NBR_BOT_TOKEN,
    whitelistedChats: process.env.NBR_WHITELISTED_CHATS.split(' ').map((id: string) => +id),
  },
  firebase: {
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.PROJECT_ID,
  },
};