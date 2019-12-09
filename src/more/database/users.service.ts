import { firestore } from 'firebase-admin';

import { UsersDatabase } from '../interfaces/database';
import { Hunter } from '../models';

export class UsersService implements UsersDatabase {
  private readonly chatRef: firestore.CollectionReference;

  constructor(private db: firestore.Firestore) {
    this.chatRef = this.db.collection('chat');
  }

  addUserInChat = async (chatId: number, hunter: Hunter): Promise<void> => {
    const user = { ...hunter };
    delete user.id;

    await this.getUserRef(chatId, hunter.id).create(user);
  };

  isUserInChat = async (chatId: number, userId: number): Promise<boolean> => {
    const query = await this.getUserRef(chatId, userId).get();

    return query.exists;
  };

  getAllUsersFromChat = async (chatId: number): Promise<Hunter[]> => {
    const usersRef = this.getUsersListRef(chatId);
    const query = await usersRef.get();

    return query.docs.map((doc: firestore.QueryDocumentSnapshot) => ({
      ...(doc.data() as Hunter),
      id: +doc.id,
    }));
  };

  getAllActiveChatsIDs = async (): Promise<number[]> => {
    const query = await this.db.collection('chat').get();

    return query.docs.map(({ id }: firestore.QueryDocumentSnapshot) => +id).filter(id => id < 0);
  };

  getUserFromChat = async (userId: number, chatId: number): Promise<Hunter> => {
    const query = await this.getUserRef(chatId, userId).get();

    return {
      ...(query.data() as Hunter),
      id: +query.id,
    };
  };

  updateUserPoints = async (chatId: number, userId: number, score: number): Promise<void> => {
    const batch = this.db.batch();

    const userRef = this.getUserRef(chatId, userId);
    batch.update(userRef, { score });

    await batch.commit();
  };

  private getUsersListRef = (chatId: number): firestore.CollectionReference => {
    return this.chatRef.doc(chatId.toString()).collection('users');
  };

  private getUserRef = (chatId: number, userId: number): FirebaseFirestore.DocumentReference => {
    return this.getUsersListRef(chatId).doc(userId.toString());
  };
}
