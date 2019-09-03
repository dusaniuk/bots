import { credential, firestore, initializeApp } from 'firebase-admin';

import { UsersDatabase } from '../interfaces/users.database';
import { CONFIG } from '../config';
import { CaptureRecord, Hunter, User } from '../models';

const serviceAccount = require('../../serviceAccountKey.json');

export class UsersService implements UsersDatabase {
  private db: firestore.Firestore;

  private huntersRef: firestore.CollectionReference;

  private pendingCapturesRef: firestore.CollectionReference;

  constructor() {
    const app = initializeApp({
      credential: credential.cert(serviceAccount),
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

  getAllUsersFromChat = async (chatId: number): Promise<User[]> => {
    const usersFromChat = this.huntersRef.where('chatId', '==', chatId);

    const querySnapshot: firestore.QuerySnapshot = await usersFromChat.get();

    const users: User[] = [];

    querySnapshot.forEach((result) => {
      users.push(result.data() as User);
    });

    return users;
  };

  addCaptureRecord = async (record: CaptureRecord): Promise<void> => {
    if (record.victims.length > 0) {
      await this.pendingCapturesRef.add(record);
    }
  };
}
