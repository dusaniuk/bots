import { credential, firestore, initializeApp } from 'firebase-admin';
import { CONFIG } from '../config';

export const createDatabase = (): firestore.Firestore => {
  const app = initializeApp({
    credential: credential.cert({
      privateKey: CONFIG.firebase.privateKey,
      clientEmail: CONFIG.firebase.clientEmail,
      projectId: CONFIG.firebase.projectId,
    }),
    databaseURL: CONFIG.firebase.databaseURL,
  });

  return app.firestore();
};
