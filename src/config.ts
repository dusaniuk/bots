const dotenv = require('dotenv');

dotenv.config();

export const CONFIG = {
  environment: process.env.ENVIRONMENT,
  isDevMode: process.env.ENVIRONMENT === 'dev',
  port: process.env.PORT,
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
