const dotenv = require('dotenv');

dotenv.config();

export default {
  botToken: process.env.BOT_TOKEN,
  firebase: {
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  },
};
