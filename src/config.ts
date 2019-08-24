import { config } from 'dotenv';

const result = config();
if (result.error) {
  throw result.error;
}

const CONFIG = {
  botToken: process.env.BOT_TOKEN,
  firebase: {
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  },
};

export default CONFIG;
