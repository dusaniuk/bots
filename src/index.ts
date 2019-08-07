import CONFIG from './config';

export const getToken = () => CONFIG.botToken;

export const test = () => 'test';

console.log('BOT_TOKEN', getToken());
