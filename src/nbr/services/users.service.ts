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
    await this.getMemgersRef()
      .doc(user.id)
      .create(user);
  };

  private getMemgersRef = (): firestore.CollectionReference => {
    return this.nbrRef.doc('group').collection('members');
  };
}
