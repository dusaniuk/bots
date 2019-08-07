import { config } from 'dotenv';

const result = config();
if (result.error) {
  throw result.error;
}

const CONFIG = {
  botToken: process.env.BOT_TOKEN,
};

export default CONFIG;
