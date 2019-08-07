import { config } from 'dotenv';

const result = config();
if (result.error) {
    throw result.error;
}

export const CONFIG = {
    botToken: process.env.BOT_TOKEN,
};
