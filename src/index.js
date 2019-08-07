import { CONFIG } from './config';

export const getToken = _ => CONFIG.botToken;

console.log('BOT_TOKEN', getToken());
