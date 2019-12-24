import { firestore } from 'firebase-admin';

export interface TelegramUser {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  allowedToAnnounce?: boolean;
}

export class UsersService {
  private readonly nbrRef: firestore.CollectionReference;

  constructor(private db: firestore.Firestore) {
    this.nbrRef = this.db.collection('nbr');
  }

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
