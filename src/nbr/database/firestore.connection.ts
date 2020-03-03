import { credential, firestore, initializeApp } from 'firebase-admin';

import { CONFIG } from '../../config';

export const createDbConnection = (): firestore.Firestore => {
  const APP_NAME = 'NBR_BOT';

  const { database: nbrDbConfig } = CONFIG.nbr;

  const app = initializeApp({
    credential: credential.cert({
      privateKey: nbrDbConfig.privateKey,
      clientEmail: nbrDbConfig.clientEmail,
      projectId: nbrDbConfig.projectId,
    }),
    databaseURL: nbrDbConfig.databaseURL,
  }, APP_NAME);

  return app.firestore();
};
