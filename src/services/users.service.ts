import { credential, firestore, initializeApp } from 'firebase-admin';

import { UsersDatabase } from '../interfaces/users.database';
import { CONFIG } from '../config';
import { CaptureRecord, Hunter } from '../models';

export class UsersService implements UsersDatabase {
  private db: firestore.Firestore;

  private huntersRef: firestore.CollectionReference;

  private pendingCapturesRef: firestore.CollectionReference;

  constructor() {
    const app = initializeApp({
      credential: credential.cert({
        privateKey: CONFIG.firebase.privateKey,
        clientEmail: CONFIG.firebase.clientEmail,
        projectId: CONFIG.firebase.projectId,
      }),
      databaseURL: CONFIG.firebase.databaseURL,
    });

    this.db = app.firestore();

    this.huntersRef = this.db.collection('hunters');
    this.pendingCapturesRef = this.db.collection('pending');
  }

  addUserInChat = async (hunter: Hunter): Promise<void> => {
    await this.huntersRef.add(hunter);
  };

  isUserInChat = async (userId: number, chatId: number): Promise<boolean> => {
    const userFromChat = this.huntersRef.where('id', '==', userId).where('chatId', '==', chatId);

    const querySnapshot: firestore.QuerySnapshot = await userFromChat.get();

    return querySnapshot.size > 0;
  };

  getAllUsersFromChat = async (chatId: number): Promise<Hunter[]> => {
    const usersFromChat = this.huntersRef.where('chatId', '==', chatId);

    const querySnapshot: firestore.QuerySnapshot = await usersFromChat.get();

    const users: Hunter[] = [];

    querySnapshot.forEach((result) => {
      users.push(result.data() as Hunter);
    });

    return users;
  };

  getUserFromChat = async (userId: number, chatId: number): Promise<{ id: string; user: Hunter }> => {
    const userFromChat = this.huntersRef.where('id', '==', userId).where('chatId', '==', chatId);
    const querySnapshot: firestore.QuerySnapshot = await userFromChat.get();

    if (querySnapshot.size !== 1) {
      throw new Error('Found a few users with same Id');
    }

    let userMap: { id: string; user: Hunter } = null;

    querySnapshot.forEach((record) => {
      userMap = {
        id: record.id,
        user: record.data() as Hunter,
      };
    });

    return userMap;
  };

  addCaptureRecord = async (record: CaptureRecord): Promise<string> => {
    const result = await this.pendingCapturesRef.add(record);

    return result.id;
  };

  getCaptureRecord = async (recordId: string): Promise<CaptureRecord> => {
    const querySnapshot = await this.pendingCapturesRef.doc(recordId).get();

    return querySnapshot.data() as CaptureRecord;
  };

  updateUserPoints = async (id: string, score: number): Promise<void> => {
    const batch = this.db.batch();

    batch.update(this.huntersRef.doc(id), { score });

    await batch.commit();
  };
}
