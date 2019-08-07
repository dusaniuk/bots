require('dotenv').config();

export const getToken = _ => process.env.BOT_TOKEN;

console.log('BOT_TOKEN', getToken());
