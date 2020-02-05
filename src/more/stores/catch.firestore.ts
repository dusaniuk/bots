import { firestore } from 'firebase-admin';
import { inject, injectable } from 'inversify';

import { Database } from '../../shared/interfaces';

import { TYPES } from '../ioc/types';
import { CatchRecord, CatchStore } from '../interfaces';


@injectable()
export class CatchFirestore implements CatchStore {
  private get chatRef(): firestore.CollectionReference {
    return this.db.collection('chat');
  }

  constructor(
    @inject(TYPES.DATABASE) private db: Database,
  ) {}

  addCatchRecord = async (chatId: number, record: CatchRecord): Promise<string> => {
    const catchRef = this.getCatchesListRef(chatId);
    const result = await catchRef.add(record);

    return result.id;
  };

  getCatchRecord = async (chatId: number, recordId: string): Promise<CatchRecord> => {
    const query = await this.getCatchRef(chatId, recordId).get();

    return query.data() as CatchRecord;
  };

  approveCatch = async (chatId: number, recordId: string): Promise<void> => {
    const batch = this.db.batch();

    const catchRef = this.getCatchRef(chatId, recordId);
    batch.update(catchRef, { approved: true });

    await batch.commit();
  };

  private getCatchesListRef = (chatId: number): firestore.CollectionReference => {
    return this.chatRef.doc(chatId.toString()).collection('captures');
  };

  private getCatchRef = (chatId: number, catchId: string): FirebaseFirestore.DocumentReference => {
    return this.getCatchesListRef(chatId).doc(catchId.toString());
  };
}
