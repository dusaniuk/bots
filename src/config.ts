const dotenv = require('dotenv');

dotenv.config();

export const CONFIG = {
  environment: process.env.ENVIRONMENT,
  port: process.env.PORT,
  botToken: process.env.BOT_TOKEN,
  firebase: {
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.PROJECT_ID,
  },
};
