import { firestore } from 'firebase-admin';

export interface TelegramUser {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
}

export class UsersService {
  private readonly nbrRef: firestore.CollectionReference;

  constructor(private db: firestore.Firestore) {
    this.nbrRef = this.db.collection('nbr');
  }

  saveUser = async (user: TelegramUser): Promise<void> => {
    const userRef = await this.getMembersRef().doc(user.id);

    const query = await userRef.get();
    if (query.exists) {
      return;
    }

    await userRef.create(user);
  };

  private getMembersRef = (): firestore.CollectionReference => {
    return this.nbrRef.doc('group').collection('members');
  };
}
