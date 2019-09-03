import { credential, firestore, initializeApp } from 'firebase-admin';

import { UsersDatabase } from '../interfaces/users.database';
import { Hunter } from '../models/hunter.model';
import CONFIG from '../config';
import { CaptureRecord } from '../models/capture-record.model';

const serviceAccount = require('../../serviceAccountKey.json');

export class UsersService implements UsersDatabase {
  private db: firestore.Firestore;

  private huntersRef: firestore.CollectionReference;

  private pendingCapturesRef: firestore.CollectionReference;

  constructor() {
    initializeApp({
      credential: credential.cert(serviceAccount),
      databaseURL: CONFIG.firebase.databaseURL,
    });

    this.db = firestore();

    this.huntersRef = this.db.collection('hunters');
    this.pendingCapturesRef = this.db.collection('pending');
  }

  addUserInChat = async (user: Hunter, chatId: number): Promise<void> => {
    await this.huntersRef.add({
      ...user,
      chatId,
    });
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

  addCaptureRecord = async (record: CaptureRecord): Promise<void> => {
    await this.pendingCapturesRef.add(record);
  };
}
