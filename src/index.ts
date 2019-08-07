import { CONFIG } from './config';

export const getToken = () => CONFIG.botToken;

console.log('BOT_TOKEN', getToken());
