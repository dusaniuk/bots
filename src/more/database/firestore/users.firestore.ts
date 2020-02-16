import { firestore } from 'firebase-admin';
import { inject, injectable } from 'inversify';

import { Database } from '../../../shared/interfaces';

import { DATABASE_TYPES } from '../types';
import { User, UsersStore } from '../../interfaces';


@injectable()
export class UsersFirestore implements UsersStore {
  private get chatRef(): firestore.CollectionReference {
    return this.db.collection('chat');
  }

  constructor(
    @inject(DATABASE_TYPES.DATABASE) private db: Database,
  ) {}

  addUserInChat = async (chatId: number, user: User): Promise<void> => {
    const userData = { ...user };
    delete userData.id;

    await this.getUserRef(chatId, user.id).create(userData);
  };

  isUserInChat = async (chatId: number, userId: number): Promise<boolean> => {
    const query = await this.getUserRef(chatId, userId).get();

    return query.exists;
  };

  updateUser = async (chatId: number, userId: number, props: Omit<Partial<User>, 'id'>): Promise<void> => {
    const batch = this.db.batch();

    const userRef = this.getUserRef(chatId, userId);
    batch.update(userRef, { ...props });

    await batch.commit();
  };

  getAllUsersFromChat = async (chatId: number): Promise<User[]> => {
    const usersRef = this.getUsersListRef(chatId);
    const query = await usersRef.get();

    return query.docs.map((doc: firestore.QueryDocumentSnapshot) => ({
      ...(doc.data() as User),
      id: +doc.id,
    }));
  };

  getUserFromChat = async (userId: number, chatId: number): Promise<User> => {
    const query = await this.getUserRef(chatId, userId).get();

    return {
      ...(query.data() as User),
      id: +query.id,
    };
  };

  private getUsersListRef = (chatId: number): firestore.CollectionReference => {
    return this.chatRef.doc(chatId.toString()).collection('users');
  };

  private getUserRef = (chatId: number, userId: number): FirebaseFirestore.DocumentReference => {
    return this.getUsersListRef(chatId).doc(userId.toString());
  };
}