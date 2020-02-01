import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  environment: process.env.ENVIRONMENT,
  isDevMode: process.env.ENVIRONMENT === 'dev',
  port: process.env.PORT,
  feedSchedule: {
    pattern: process.env.FEED_PATTERN,
    targetChat: process.env.FEED_TARGET,
  },
  max: {
    botToken: process.env.MAX_BOT_TOKEN,
  },
  more: {
    botToken: process.env.MORE_BOT_TOKEN,
  },
  nbr: {
    botToken: process.env.NBR_BOT_TOKEN,
  },
  firebase: {
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.PROJECT_ID,
  },
};
