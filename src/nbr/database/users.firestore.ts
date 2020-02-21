import { firestore } from 'firebase-admin';
import { inject, injectable } from 'inversify';

import { UsersStore } from '../core/interfaces/store';
import { Database } from '../../shared/interfaces';
import { TYPES } from '../types';
import { TelegramUser } from '../core/interfaces/telegramUser';

@injectable()
export class UsersFirestore implements UsersStore {
  private get nbrRef(): firestore.CollectionReference {
    return this.db.collection('nbr');
  }

  constructor(
    @inject(TYPES.DATABASE) private db: Database,
  ) { }

  getUser = async (userId: string): Promise<TelegramUser> => {
    const query = await this.getMemberRef(userId).get();

    return query.exists ? (query.data() as TelegramUser) : null;
  };

  saveUser = async (user: TelegramUser): Promise<void> => {
    const dbUser = await this.getUser(user.id);
    if (dbUser !== null) {
      return;
    }

    await this.getMemberRef(user.id).create(user);
  };

  private getMembersRef = (): firestore.CollectionReference => {
    return this.nbrRef.doc('group').collection('members');
  };

  private getMemberRef = (memberId: string): firestore.DocumentReference => {
    return this.getMembersRef().doc(memberId);
  };
}
