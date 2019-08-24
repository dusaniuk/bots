import { firestore } from 'firebase';
import { ContextMessageUpdate } from 'telegraf';

import CONFIG from './config';
import { Hunter } from './models/hunter.model';
import { createHunter, getHunterName } from './utils';

import QuerySnapshot = firestore.QuerySnapshot;

const Telegraf = require('telegraf');
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

const bot = new Telegraf(CONFIG.botToken);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: CONFIG.firebase.databaseURL,
});

const db: firestore.Firestore = admin.firestore();
const huntersRef = db.collection('hunters');

bot.command('reg', async (ctx: ContextMessageUpdate) => {
  const userFromChat = huntersRef.where('id', '==', ctx.from.id).where('chatId', '==', ctx.chat.id);

  const querySnapshot: QuerySnapshot = await userFromChat.get();
  if (querySnapshot.size > 0) {
    return ctx.reply("Hey, you're already in the game!");
  }

  const hunter: Hunter = createHunter(ctx);
  await huntersRef.add(hunter);

  const response = getHunterName(hunter);

  return ctx.reply(`Welcome, ${response}. Fight for your points!`);
});

bot.launch();
