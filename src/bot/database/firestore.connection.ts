import { credential, firestore, initializeApp } from 'firebase-admin';

import { CONFIG } from '../../config';

export const createDbConnection = (): firestore.Firestore => {
  const APP_NAME = 'MORE_BOT';

  const { database: moreDBConfig } = CONFIG.more;

  const app = initializeApp({
    credential: credential.cert({
      privateKey: moreDBConfig.privateKey,
      clientEmail: moreDBConfig.clientEmail,
      projectId: moreDBConfig.projectId,
    }),
    databaseURL: moreDBConfig.databaseURL,
  }, APP_NAME);

  return app.firestore();
};
