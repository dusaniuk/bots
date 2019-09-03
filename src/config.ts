const dotenv = require('dotenv');

dotenv.config();

export const CONFIG = {
  botToken: process.env.BOT_TOKEN,
  firebase: {
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  },
};
